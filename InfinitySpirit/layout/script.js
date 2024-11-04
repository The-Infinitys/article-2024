const create_gotop_button = () => {
  const go_top = document.createElement("button");
  go_top.id = "go-top";
  go_top.innerHTML = `
  <svg
    viewBox="0 0 100 100"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    fill="none"
    stroke="#888"
    stroke-width="2">
    <g>
      <animate
        attributeName="stroke"
        dur="5s"
        repeatCount="indefinite"
        values="#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000"
        >
      </animate>
      <circle cx="50" cy="50" r="40" />
      <path d="M 80 45 L50 25 L 20 45" />
      <path d="M 80 55 L50 35 L 20 55" />
      <circle cx="50" cy="65" r="20"/>
      <ellipse cx="40" cy="65" rx="10" ry="8" stroke-width="1" />
      <ellipse cx="60" cy="65" rx="10" ry="8" stroke-width="1" />
    </g>
  </svg>
  `;
  go_top.onclick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };
  document.body.append(go_top);
};
create_gotop_button();
const makeIndex = () => {
  const article_index = document.querySelector(".article-index");
  const article_content = document.querySelector("InfinitySpiritContent");
  for (let index = 0; index < article_content.children.length; index++) {
    const element = article_content.children[index];
    const tagname = element.tagName.toLowerCase();
    if (
      tagname in
      {
        h1: "",
        h2: "",
        h3: "",
        h4: "",
      }
    ) {
      const tag = document.createElement("a");
      tag.innerHTML = element.outerHTML;
      tag.href = "#" + element.id;
      tag.addEventListener("click", () => {
        setTimeout(() => {
          const header_height = parseInt(
            String(
              getComputedStyle(
                document.querySelector(":root")
              ).getPropertyValue("--header-height")
            ).trim()
          );
          window.scrollBy(0, -header_height);
        }, 0);
      });
      article_index.append(tag);
    }
  }
  const scroll_index = () => {
    const body_scroll = window.scrollY / document.body.scrollHeight;
    const index_scrollTop_target =
      body_scroll * document.querySelector(".article-index").scrollHeight -
      document.querySelector(".article-index").scrollTop;
    const index_scrollTop_now =
      document.querySelector(".article-index").scrollTop;
    document.querySelector(".article-index").scrollTop +=
      (index_scrollTop_target - index_scrollTop_now) / 30;
    requestAnimationFrame(scroll_index);
  };
  scroll_index();
};
makeIndex();

let renew_clock_watch_count = 0;
try {
  document.querySelector("InfinitySpiritDate").innerHTML =
    document.querySelector("date").innerHTML;
} catch (SyntaxError) {
  console.log("not found date object");
}
if (document.querySelector(".article-title").innerHTML == "") {
  document.querySelector("InfinitySpiritTitle").innerHTML =
    document.querySelector("InfinitySpiritContent h1").innerHTML;
}
const renew_Infinity_clock = () => {
  renew_clock_watch_count = (renew_clock_watch_count + 1) % 5;
  if (renew_clock_watch_count == 0) {
    const now = new Date();
    const clock_hand_svg = document.querySelector(".Infinity-clock_hands");
    const now_hours = now.getHours();
    const now_minutes = now.getMinutes();
    const now_seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const short_way =
      ((((now_hours + now_minutes / 60) / 12) * 360 - 90) * Math.PI) / 180;
    const long_way = (((now_minutes / 60) * 360 - 90) * Math.PI) / 180;
    const thin_way = (((now_seconds / 60) * 360 - 90) * Math.PI) / 180;
    clock_hand_svg.innerHTML =
      `
    <path d="M50 50,l` +
      (30 * Math.cos(thin_way)).toString() +
      " " +
      (30 * Math.sin(thin_way)).toString() +
      `Z" stroke-width="1" />
    <path d="M50 50,l` +
      (30 * Math.cos(long_way)).toString() +
      " " +
      (30 * Math.sin(long_way)).toString() +
      `Z" />
    <path d="M50 50,l` +
      (20 * Math.cos(short_way)).toString() +
      " " +
      (20 * Math.sin(short_way)).toString() +
      `Z" />
  `;
  }
  requestAnimationFrame(renew_Infinity_clock);
};
renew_Infinity_clock();

const recommendArticles = async () => {
  const article_list = document.querySelector(".articles-recommended");
  article_list.innerHTML = "";
  article_info_datas = [];
  const add_article_button = (article_info) => {
    const article_button = document.createElement("button");
    const article_root_path =
      "../../" +
      (article_info.month + 1).toString().padStart(2, "0") +
      "/" +
      article_info.id +
      "/";
    article_button.onclick = () => {
      window.location.href = article_root_path;
    };
    const thumbnail = new Image();
    if (article_info.thumbnail == "") {
      thumbnail.src = "../../InfinitySpirit/layout/image/loading.svg";
    } else {
      thumbnail.src = article_root_path + article_info.thumbnail;
    }
    const loading = new Image();
    loading.src = "../../InfinitySpirit/layout/image/loading.svg";
    const title = document.createElement("div");
    title.innerHTML =
      "<h1>" + article_info.title + "</h1><p>date: " + article_info.date;
    article_button.append(loading);
    article_button.append(thumbnail);
    article_button.append(title);
    article_list.append(article_button);
  };
  for (let month_count = 0; month_count < 12; month_count++) {
    const this_month = new Date().getMonth();
    const list_path =
      "../../" +
      (1 + ((12 + this_month - month_count) % 12)).toString().padStart(2, "0") +
      "/articles.json";
    await fetch(list_path)
      .then((res) => res.json())
      .then((article_data) => {
        const datas = article_data.articles;
        datas.forEach((article_info) => {
          article_info.month = (this_month - month_count) % 12;
          add_article_button(article_info);
        });
      });
  }
};
recommendArticles();
const copyURL = () => {
  const copyToClipBoard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("copied!");
      },
      () => {
        alert("failed to copy...");
      }
    );
  };
  copyToClipBoard(window.location.href);
};
const shareX = () => {
  const target_url = window.location.href;
  const target_text = document.title + " - The Infinity's";
  const target_hashtags = "BelieveTheInfinityPossibility";
  const X_url =
    "https://x.com/intent/post?url=" +
    encodeURI(target_url) +
    "&text=" +
    encodeURI(target_text) +
    "&hashtags=" +
    encodeURI(target_hashtags);
  window.open((url = X_url), (target = "_blank"));
};

