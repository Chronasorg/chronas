import properties from '../../../../src/properties'

export let provinceGeojson = {}
export let rulPlus = {}
export let culPlus = {}
export let relPlus = {}

export const initializeData = (props) => {
  fetch(properties.chronasApiHost + "/metadata/items")
    .then(res => res.text())
    .then( (res) => {
      rulPlus = JSON.parse(res).rulPlus
      relPlus = JSON.parse(res).relPlus
    }).then(() => fetch(properties.chronasApiHost + "/metadata/provinces"))
    .then(res => res.text())
    .then( (res) => {
      provinceGeojson = JSON.parse(res)
      props.setLoadStatus(false)
    })

  return 1
}
