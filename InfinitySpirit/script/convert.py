import os
import sys
import markdown
import json
from script import search, loadsetting

template_html = ""
replace_pos = {}
legacy_repository_name = "article-2024"


def find_elem(tag, key) -> None:
    if "<" + tag + ">" in template_html and "</" + tag + ">" in template_html:
        print(
            "InfinitySpirit.markdownconverter log: succeeded to load location of",
            key,
        )
        replace_pos[key] = template_html[
            template_html.find("<" + tag + ">") : template_html.find("</" + tag + ">")
            + len("</" + tag + ">")
        ]
    else:
        print(
            "InfinitySpirit.markdownconverter error: failed to load location of",
            key,
        )
        sys.exit(1)


with open("./InfinitySpirit/layout/index.html") as f:
    template_html = f.read()
    find_elem("InfinitySpiritTitle", "title")
    find_elem("InfinitySpiritContent", "content")
    find_elem("InfinitySpiritDate", "date")
    find_elem("InfinitySpiritThumbnail", "thumbnail")


def mdc(markdown_text,type="markdown"):
    extensions = [
        "extra",
        "admonition",
        "codehilite",
        "legacy_attrs",
        "legacy_em",
        "nl2br",
        "sane_lists",
        "toc",
        "wikilinks",
        "meta",
        "smarty",
    ]
    configs = {
        "codehilite": {
            "noclasses": True,
            "pygments_style": "monokai",
        }
    }
    global markdown_title
    markdown_result = ""
    markdown_title = ""
    markdown_date = ""
    convert_mode = {"~~": False}
    for markdown_line in markdown_text.split("\n"):
        # ~~を変換する機能がないので自分で実装する
        if type=="markdown":
            while "~~" in markdown_line:
                if convert_mode["~~"]:
                    markdown_line = markdown_line.replace("~~", "</s>", 1)
                else:
                    markdown_line = markdown_line.replace("~~", "<s>", 1)
                convert_mode["~~"] = not convert_mode["~~"]
            if markdown_line.startswith("# title: "):
                markdown_title = markdown_line[9:]
            elif markdown_line.startswith("# date: "):
                markdown_date = markdown_line[8:]
            elif markdown_line.startswith("# ") and markdown_title == "":
                markdown_title = markdown_line[2:]
                markdown_result += markdown_line + "\n"
            elif markdown_line.startswith("<h1>") and markdown_title == "":
                markdown_title = markdown_line.replace("<h1>", "").replace("</h1>", "")
                markdown_result += markdown_line + "\n"
            elif markdown_line.startswith("<date>"):
                markdown_date = (
                    markdown_line.replace("<date>", "")
                    .replace("</date>", "")
                    .replace(" ", "")
                )
            else:
                markdown_result += markdown_line + "\n"
        else:
            if markdown_line.startswith("<h1>") and markdown_title == "":
                markdown_title = markdown_line.replace("<h1>", "").replace("</h1>", "")
                markdown_result += markdown_line + "\n"
            elif markdown_line.startswith("<date>"):
                markdown_date = (
                    markdown_line.replace("<date>", "")
                    .replace("</date>", "")
                    .replace(" ", "")
                )
            else:
                markdown_result += markdown_line + "\n"
    if type=="markdown":
        return {
            "html": markdown.markdown(
                markdown_result, extensions=extensions, extension_configs=configs
            ),
            "title": markdown_title,
            "date": markdown_date,
        }
    else:
        return {
            "html": markdown_result,
            "title": markdown_title,
            "date": markdown_date,
        }


def indent_html(html, indent_level) -> str:
    result = ""
    mode_code = False
    for line in html.split("\n"):
        if line.startswith('<div class="codehilite"') and not mode_code:
            mode_code=True
        elif line.startswith("</code></pre></div>") and mode_code:
            mode_code=False
        if mode_code:
            result += line + "\n"
        else:
            result += " " * indent_level + line + "\n"
    return result


def convert(date, now_year, indent) -> None:
    target = {"year": date[0], "month": date[1]}
    if target["year"] == now_year:
        month_dir = str(target["month"]).zfill(2)
        article_dirs = search.folders(month_dir)
        article_index_list = []
        for article_dir in article_dirs:
            print(article_dir)
            markdown_path = "./" + month_dir + "/" + article_dir + "/article.md"
            html_path = "./" + month_dir + "/" + article_dir + "/article.html"
            if os.path.isfile(markdown_path) or os.path.isfile(html_path):
                converted=""
                if os.path.isfile(markdown_path):
                    with open(markdown_path) as f:
                        converted = mdc(f.read())
                else:
                    with open(html_path) as f:
                        converted = mdc(f.read(),type="html")
                base_html = converted["html"]
                article_title = converted["title"]
                article_date = converted["date"]
                print("article id:", article_dir)
                print("article title:", article_title)
                print("article date:", article_date)
                export_html = template_html
                export_html = export_html.replace(
                    replace_pos["title"], article_title
                )
                base_html = (
                    indent_html(base_html, indent)
                    + "\n"
                    + indent * " "
                    + "</InfinitySpiritContent>"
                )
                export_html = export_html.replace(
                    replace_pos["content"], "<InfinitySpiritContent>\n" + base_html
                )
                export_html = export_html.replace(
                    replace_pos["date"],
                    "<InfinitySpiritDate>" + article_date + "</InfinitySpiritDate>",
                )
                article_thumbnail = ""
                for file_name in search.files("./" + month_dir + "/" + article_dir):
                    if file_name.startswith("thumbnail"):
                        article_thumbnail = file_name
                export_html = export_html.replace(
                    replace_pos["thumbnail"], 
                    "https://the-infinitys.f5.si/article-2024/" + 
                    month_dir + "/" + article_dir + "/" + article_thumbnail
                )
                with open(
                    "./" + month_dir + "/" + article_dir + "/index.html", mode="w"
                ) as index_html:
                    index_html.write(export_html)
                article_index_list.append(
                    {
                        "id": article_dir,
                        "title": article_title,
                        "date": article_date,
                        "thumbnail": article_thumbnail,
                    }
                )

        def get_date(obj) -> str:
            return obj["date"]

        with open("./" + month_dir + "/articles.json", mode="w") as f:
            article_index_list.sort(key=get_date, reverse=True)
            f.write(
                json.dumps(
                    {"articles": article_index_list},
                    indent=2,
                )
            )
