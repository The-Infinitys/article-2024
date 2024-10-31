const emulate_user = (username) => {
  if (document.querySelector("#topnav") == null) {
    alert("非対応です。\n対応するまでお待ちください...");
    return;
  }
  const get_cliped_name = (name) => {
    if (name.length <= 11) {
      return name;
    } else {
      return name.substring(0, 11) + "...";
    }
  };
  const cliped_name = get_cliped_name(username);
  const set_img_url = (name) => {
    fetch("https://api.scratch.mit.edu/users/" + name + "/")
      .then((res) => res.json())
      .then((data) => {
        const img_url = data["profile"]["images"]["32x32"];
        document.querySelector("span.user-name.dropdown-toggle").innerHTML = `
        <img class="user-icon" src="${img_url}" width="24" height="24">${cliped_name}<span class="caret"></span>`;
      })
      .catch((err) => alert(err));
  };
  set_img_url(username);
  if (
    !window.location.href.startsWith(
      "https://scratch.mit.edu/users/" + username
    )
  ) {
    return;
  }
  const unescapehtml = (str) =>
    str
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("<br>", "\n")
      .replaceAll(/<[^>]*>/g, "\n");
  const bio_elem = document.querySelector("#bio-readonly");
  bio_elem.id = "bio";
  bio_elem.className = "editable read";
  const bio_text = unescapehtml(bio_elem.children[0].children[0].innerHTML);
  bio_elem.innerHTML = `<span data-content="prompt" style="display: none;">簡単に自己紹介してください。</span>
<span class="small-text" style="display: none;">あと <span id="bio-chars-left">200</span> 文字。</span>
<form>
<textarea name="bio">${bio_text}</textarea>
</form>`;
  const status_elem = document.querySelector("#status-readonly");
  status_elem.id = "status";
  status_elem.className = "editable read";
  const status_text = unescapehtml(
    status_elem.children[0].children[0].innerHTML
  );
  status_elem.innerHTML = `<span data-content="prompt">あなたが取り組んでいることを説明してください。</span>
<span class="small-text">あと<span id="status-chars-left">200</span>文字。</span>
<form>
<textarea name="status">${status_text}</textarea>
</form>`;
  document.querySelector("#follow-button > div").remove();
};
emulate_user(prompt("username: "));
