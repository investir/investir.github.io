import debounce from 'lodash/debounce'

/**
 * Init search system
 * @param {Object} companies list of companies
 */
export const initSearch = (companies) => {
  bulmahead(
    "search",
    "prova-menu",
    (searchTerm) =>
      new Promise(
        (filter, rj) =>
          filter(
            companies
              .filter(
                (company) =>
                  company.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  company.tick
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((company) => ({
                label: `${company.tick} - ${company.name}`,
                value: company.tick,
              }))
          )
      ),
    (result) => {
      console.log(result);
      document.location.href = `/empresas.html?papel=${result.value}`;
    },
    100,
    0
  );
}

const bulmahead = (id, idMenu, api, onSelect, delay, minLen = 0) => {
  const input = document.getElementById(id)
  const menuEl = document.getElementById(idMenu)
  menuEl.innerHTML = '<div class="dropdown-content"></div>'

  const setValue = e => {
    e.preventDefault()
    var label = e.target.text
    var value = e.target.dataset.value
    input.value = label
    menuEl.style.display = 'none'
    if (onSelect) {
      onSelect({ label, value })
    }
    return false
  }

  const handleApi = e => {
    const value = e.target.value
    menuEl.style.display = 'none'
    menuEl.innerHTML = '<div class="dropdown-content"></div>'
    if (value.length <= minLen) {
      return
    }
    api(value).then(suggestions => {
      const suggestionsEl = suggestions.map(({ label, value }) => {
        const a = document.createElement('a')
        a.href = '#'
        a.classList.add('dropdown-item')
        a.innerHTML = label
        a.dataset.value = value
        a.addEventListener('click', setValue)
        return a
      })
      suggestionsEl.map(suggEl => {
        menuEl.childNodes[0].appendChild(suggEl)
      })
      if (suggestions.length > 0) {
        menuEl.style.display = 'block'
      }
    })
  }
  input.addEventListener('input', debounce(handleApi, delay))
  input.addEventListener('focusout', e => {
    if (e.relatedTarget === null || !e.relatedTarget.classList.contains('dropdown-item')) {
      menuEl.style.display = 'none'
    }
  })
  input.addEventListener('focusin', handleApi)
}
