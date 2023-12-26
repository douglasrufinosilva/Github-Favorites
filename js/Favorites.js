import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [] 
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  } 

  async add(username) {
    try {
      const userExists = this.entries.find( entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)

      if(!user.login || user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }

    this.clearInput()
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => {
      return entry.login !== user.login
    })

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addBtn = this.root.querySelector('.search button')

    addBtn.addEventListener('click', () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    })
  }

  clearInput() {
    const input = this.root.querySelector('.search input')

    input.value = ''
  }

  update() {
    this.removeAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').addEventListener('click', () => {
        const deleteUser = confirm('Tem certeza que deseja deletar esse usuário?')

        if(deleteUser) {
          this.delete(user)
        }
      })

      this.tbody.append(row)
    })
    
    this.clearInput()
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <tr>
      <td class="user">
        <img src="https://github.com/douglasrufinosilva.png" alt="Imagem de Douglas Rufino">
        <a href="https://github.com/douglasrufinosilva" target="_blank">
          <p>Douglas Rufino</p>
          <span>douglasrufinosilva</span>
        </a>
      </td>

      <td class="repositories">
        76
      </td>

      <td class="followers">
        56
      </td>

      <td>
        <button class="remove">&times;</button>
      </td>
    </tr>
  `

  return tr
  }

  removeAllTr() {
        this.tbody.querySelectorAll('tr')
        .forEach((tr) => {
          tr.remove()
        })
  }
}