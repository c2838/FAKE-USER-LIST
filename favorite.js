const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";

const users = JSON.parse(localStorage.getItem('favoriteUsers')) || [];

let filteredUsers = []
const USER_PER_PAGE = 20

const navbar = document.querySelector("#navbar")
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator")
const searchInput = document.querySelector("#search-input")
const searchForm = document.querySelector("#search-form")


// 渲染user lsit
function renderUserList(users) {
  let content = "";

  if (!users.length) dataPanel.innerHTML = '<h2 style="color: #FF5809">Add your friend into favorite list!</h2>'
  else {
    users.forEach((user) => {
      if (!user.avatar) {
        user.avatar = "https://robohash.org/56456165165"
      }
      content += `<div class="card m-1 align-items-center" style="width: 18rem;">
    <div class="for-img d-flex justify-content-center">
    <img src="${user.avatar}" class="card-img-top m-2 w-75 rounded-circle border border-info border-2" data-bs-toggle="modal" data-bs-target="#user-modal" alt="user-avatar" role="button" id="user-avatar" data-id="${user.id}"><span class="tooltiptext">Click to show more</span>
    </div>
    <div class="d-flex justify-content-around card-body">
      <h5 class="card-title my-auto me-3">${user.name} ${user.surname}</h5>
      <i class="fa-regular fa-trash-can fa-xl btn-remove-favorite my-auto" role="button" data-id="${user.id}"  style="color: #6adb1f;"><span class="tooltiptext">click to del</span></i>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = content;
  }
}

// 渲染paginator
function renderPaginator(amount) {
  const numbersOfPages = Math.ceil(amount / USER_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= numbersOfPages; page++) {
    rawHTML += `<li class="${page === 1 ? 'page-item mb-3 active' : 'page-item mb-3'}"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 將user lsit/filteres list分頁，每次回傳20個值
function getUserByPage(page) {
  let startIndex = (page - 1) * (USER_PER_PAGE)

  let user = filteredUsers.length ? filteredUsers : users

  return user.slice(startIndex, startIndex + USER_PER_PAGE)
}

// 將最愛移除local storage
function removeFromFavorite(id) {
  const userIndex = users.findIndex(user => user.id === id)
  const filteredUserIndex = filteredUsers.findIndex(user => user.id === id)

  if (userIndex === -1 && filteredUserIndex === -1) return

  filteredUsers.splice(filteredUserIndex, 1)

  users.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))


  let page = 0

  if (filteredUsers.length) {
    // 保留在搜尋頁面不跳轉
    page = Math.ceil(filteredUserIndex / USER_PER_PAGE)
    renderUserList(filteredUsers)
    renderPaginator(filteredUsers.length)
  } else {
    // 當搜尋陣列被刪除光自動跳轉回原始最愛清單
    page = Math.ceil(userIndex / USER_PER_PAGE)
    renderUserList(users)
    renderPaginator(users.length)
  }
}


// Modal內容
function showUserModal(id) {
  const USER_URL = `${INDEX_URL}/${id}`;
  const TITLE = document.querySelector(".modal-title");
  const userContent = document.querySelector("#user-content");
  const userAvatar = document.querySelector("#user-image");

  axios.get(USER_URL).then((res) => {
    let result = res.data;
    let liStartTag = '<li class="list-group-item" id="user-modal-'
    let liEndTag = '</li>'
    TITLE.innerHTML = `<strong>User Introduction</strong>`;
    if (!result.avatar) {
      result.avatar = "https://robohash.org/56456165165"
    }
    userAvatar.innerHTML = `<img src="${result.avatar}" class="card-img-top rounded-circle border border-info border-2" alt="avatar">`;
    userContent.innerHTML = `
      <ul class="list-group list-group-flush">
          ${liStartTag}name">Name: ${result.name} ${result.surname}${liEndTag}
          ${liStartTag}email">Email: ${result.email}${liEndTag}
          ${liStartTag}gender">Gender: ${result.gender}${liEndTag}
          ${liStartTag}age">Age: ${result.age}${liEndTag}
          ${liStartTag}region">Region: ${result.region}${liEndTag}
          ${liStartTag}birthday">Birthday: ${result.birthday}${liEndTag}
          </ul>`;
  });
}

// 事件監聽，分頁切換
paginator.addEventListener("click", function onPaginatorClick(event) {
  let target = event.target;

  if (target.tagName !== 'A') return

  let pageItem = document.querySelectorAll(".page-item")
  pageItem.forEach(item => {
    item.classList.remove("active")
  })
  target.parentElement.classList.toggle("active")

  const page = target.dataset.page
  renderUserList(getUserByPage(page))
})


// 事件監聽，觸發Modal & 刪除最愛
dataPanel.addEventListener("click", function onPanelClick(event) {
  let target = event.target;
  let id = Number(target.dataset.id);
  if (target.matches(".card-img-top")) {
    showUserModal(id);
  } else if (target.matches(".btn-remove-favorite")) {
    removeFromFavorite(id);
  }
});

// 事件監聽，搜尋姓名
searchForm.addEventListener("submit", function onSearchForm(event) {
  event.preventDefault()
  const keywords = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter(user => user.name.toLowerCase().includes(keywords) || user.surname.toLowerCase().includes(keywords))

  if (!filteredUsers.length)
    return alert(`Cannot find user keyword: ${keywords}`)

  renderPaginator(filteredUsers.length)
  renderUserList(getUserByPage(1))
})


renderPaginator(users.length)
renderUserList(users)