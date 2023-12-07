const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";

const users = [];
const USER_PER_PAGE = 20

const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []

let filteredUsers = []

const navbar = document.querySelector("#navbar")
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator")
const searchInput = document.querySelector("#search-input")
const searchForm = document.querySelector("#search-form")

// 渲染user lsit
function renderUserList(users) {
  let content = "";
  let favIcon = ""
  users.forEach((user) => {
    if (!user.avatar) {
      user.avatar = "https://robohash.org/56456165165"
    }

    content += `<div class="card m-1 align-items-center" style="width: 18rem;">
    <div class="for-img d-flex justify-content-center">
    <img src="${user.avatar}" class="card-img-top m-2 w-75 rounded-circle border border-info border-2" data-bs-toggle="modal" data-bs-target="#user-modal" alt="user-avatar" role="button" id="user-avatar" data-id="${user.id}"><span class="tooltiptext">Click to show more</span>
    </div>
    <div class="d-flex justify-content-around card-body">
      <h5 class="card-title my-auto me-3">${user.name} ${user.surname}</h5>`

    favIcon = `<i class="${list.some(favor => favor.id === user.id) ? 'fa-solid' : 'fa-regular'} fa-heart fa-xl my-auto" role="button" data-id="${user.id}" style="color:#ef0b0b;"><span class="tooltiptext">${list.some(favor => favor.id === user.id) ? 'click to del' : 'click to add'}</span></i>`

    content += `${favIcon}</div>
      </div>`
  });
  dataPanel.innerHTML = content;
}

// 將user lsit/filteres list分頁，每次回傳20個值
function getUserByPage(page) {
  let startIndex = (page - 1) * (USER_PER_PAGE)

  let user = filteredUsers.length ? filteredUsers : users

  return user.slice(startIndex, startIndex + USER_PER_PAGE)
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

// 將最愛放入local storage
function addToFavorite(id) {
  const user = users.find(user => user.id === id)

  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list));

  // 搜尋關鍵字時也可以新增或刪除最愛(利用index取代id，避免抓到過大的頁數)
  if (filteredUsers.length) {
    id = filteredUsers.findIndex(user => user.id === id)
    if (id % 20 === 0) {
      id += 1
    }
  }
  // 維持當前頁面，不要跳轉
  let page = Math.ceil(id / USER_PER_PAGE)
  renderUserList(getUserByPage(page))
}

// 將最愛移除local storage
function removeFromFavorite(id) {
  const userIndex = list.findIndex(user => user.id === id)

  if (userIndex === -1) return

  list.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))

  // 搜尋關鍵字時也可以新增或刪除最愛(利用index取代id，避免抓到過大的頁數)
  if (filteredUsers.length) {
    id = filteredUsers.findIndex(user => user.id === id)
    if (id % 20 === 0) {
      id += 1
    }
  }
  // 維持當前頁面，不要跳轉
  let page = Math.ceil(id / USER_PER_PAGE)
  renderUserList(getUserByPage(page))
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

// 初始渲染頁面(第1頁)
function getUsersList() {
  axios
    .get(INDEX_URL)
    .then((res) => {
      users.push(...res.data.results);
      renderPaginator(users.length)
      renderUserList(getUserByPage(1));
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

// 事件監聽，觸發Modal & 加入/移除最愛
dataPanel.addEventListener("click", function onPanelClick(event) {
  let target = event.target;
  let id = Number(target.dataset.id);
  if (target.matches(".card-img-top")) {
    showUserModal(id);
  }
  // 加入最愛
  if (target.matches(".fa-regular")) {
    addToFavorite(id);
  }
  // 移除最愛
  if (target.matches(".fa-solid")) {
    removeFromFavorite(id)
  }
});

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



getUsersList();