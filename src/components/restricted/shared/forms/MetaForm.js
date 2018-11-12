import React, { Children, Component } from 'react'

import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import getDefaultValues from 'admin-on-rest/lib/mui/form/getDefaultValues'
import FormInput from 'admin-on-rest/lib/mui/form/FormInput'
import Toolbar from 'admin-on-rest/lib/mui/form/Toolbar'
import axios from 'axios'
import { setModType, setModData } from '../buttons/actionReducers'
import { updateSingleMetadata } from './../../../map/data/actionReducers'
import { properties } from '../../../../properties'
import { showNotification } from 'admin-on-rest'
import { TYPE_METADATA } from '../../../map/actionReducers'
import utilsQuery from '../../../map/utils/query'
const jsonp = require('jsonp')

const styles = {
  drawerForm: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  formStyle: {
    boxShadow: 'rgba(0, 0, 0, 0.4) 0px -4px 4px -3px inset',
    padding: '0 1em 1em 1em',
    maxHeight: 'calc(100% - 236px)',
    background: '#f3f3f2',
    overflow: 'auto',
    width: '100%'
  }
}

function hexToRgb (hex) {
  var c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return 'rgb(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ')'
  }
  throw new Error('Bad Hex')
}

export class MetaForm extends Component {
  state = {
    metaToUpdate: '',
    successFullyUpdated: false
  }

  handleSubmitWithRedirect = (redirect = this.props.redirect, value) =>
    this.props.handleSubmit(values => {
      const { initialValues, history, metadataEntity } = this.props

      if (values.color && values.color[0] === '#') {
        values.color = hexToRgb(values.color)
      }
      const wikiURL = values.url
      const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
      let newWikiURL
      if (wikiIndex > -1) {
        newWikiURL = wikiURL.substr(wikiIndex + 20)
      } else {
        return 'Not a full Wikipedia URL'
      }

      if (values.type === 'e') {
        const nextBodyByType = {
          '_id': 'e_' + newWikiURL,
          'name': values.title,
          'data': {
            'title': values.title,
            'wiki': newWikiURL,
            'start': +values.start,
            'end':  +values.end,
            'participants': (values.participants || []).map(el => el.participantTeam.map(el2 => el2.name)),
            'content': (values.content || []).map((el) => {
              const contentType = (el.contentType.substr(0, 2) === 'w|') ? 'markers' : 'metadata'
              return contentType + '||' + el.name
            }),
            'poster': values.poster,
            'partOf': values.partOf,
          },
          'wiki': newWikiURL,
          'subtype': values.subtype,
          'year': +values.start,
          'score': 0,
          'coo':  values.coo,
          'type': values.type
        }

        const bodyToSend = { ...nextBodyByType }
        const metadataItem = values.type
        const token = localStorage.getItem('chs_token')
        fetch((redirect === 'create') ? properties.chronasApiHost + '/metadata/' : properties.chronasApiHost + '/metadata/e_' + newWikiURL, {
          method: (redirect === 'create') ? 'POST' : 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyToSend)
        })
          .then((res) => {
            if (res.status === 200) {
              this.setState({
                metaToUpdate: metadataItem,
                successFullyUpdated: true
              })
              this.props.showNotification((redirect !== 'create') ? 'Epic successfully updated' : 'Epic successfully added')
              history.goBack()
            } else {
              this.setState({
                metaToUpdate: '',
                successFullyUpdated: false
              })
              this.props.showNotification((redirect !== 'create') ? 'Epic not updated' : 'Epic not added', 'warning')
            }
          })
      } else {
        const wikiURL = values.url
        const wikiIndex = wikiURL.indexOf('.wikipedia.org/wiki/')
        let newWikiURL
        if (wikiIndex > -1) {
          newWikiURL = wikiURL.substr(wikiIndex + 20)
        } else {
          return 'Not a full Wikipedia URL'
        }

        const iconURL = values.icon || ''
        const fileIndex = iconURL.indexOf('media/File:') + 6
        const iconUrlPromise = new Promise((resolve, reject) => {
          if (values.icon === initialValues.icon) {
            resolve(iconURL)
          } else if (fileIndex !== 5) {
            const filePath = iconURL.substr(fileIndex)
            jsonp('https://commons.wikimedia.org/w/api.php?action=query&titles=' + filePath + '&prop=imageinfo&&iiprop=url&iiurlwidth=100&format=json', null, (err, rulerMetadata) => {
              if (err) {
                resolve('')
              } else {
                let thumbUrl = Object.values(rulerMetadata.query.pages)[0].imageinfo[0].thumburl
                const startUrl = thumbUrl.indexOf('/thumb/') + '/thumb/'.length
                const lastl = thumbUrl.substr(startUrl).lastIndexOf('/')
                const endUrl = (lastl === -1) ? lastl + startUrl : lastl + startUrl// - 1
                thumbUrl = thumbUrl.substring(startUrl, endUrl)

                resolve(thumbUrl)
              }
            })
          } else if ((iconURL.indexOf('/thumb/') > -1) && (iconURL.indexOf('/100px-') === -1)) {
            // wikicommons thumb, but not in right resolution!
            const afterRes = iconURL.indexOf('px-')
            const beforeRes = iconURL.substring(0, afterRes).lastIndexOf('/')

            resolve(iconURL.substring(0, beforeRes) + '/100' + iconURL.substr(afterRes))
          } else {
            const imageName = iconURL.substr(iconURL.lastIndexOf('/') + 1).replace(/File:/g, '')
            jsonp('https://en.wikipedia.org/w/api.php?action=query&titles=Image:' + imageName + '&prop=imageinfo&iiprop=url&iiurlwidth=100&format=json', null, (err, rulerMetadata) => {
              // 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + filePath + '&prop=imageinfo&&iiprop=url&iiurlwidth=100&format=json', null, (err, rulerMetadata) => {
              if (err) {
                return reject(err)
              } else {
                let thumbUrl = Object.values(rulerMetadata.query.pages)[0].imageinfo[0].thumburl
                const startUrl = thumbUrl.indexOf('/thumb/') + '/thumb/'.length
                const lastl = thumbUrl.substr(startUrl).lastIndexOf('/')
                const endUrl = (lastl === -1) ? lastl + startUrl : lastl + startUrl // - 1
                thumbUrl = thumbUrl.substring(startUrl, endUrl)
                if (!thumbUrl) {
                  return reject(err)
                }
                resolve(thumbUrl)
              }
            })
          }
        })

        iconUrlPromise.then((iconUrl) => {
          const nextBodyByType = {
            ruler: [values.name, values.color, newWikiURL, iconUrl],
            culture: [values.name, values.color, newWikiURL, iconUrl],
            religion: [values.name, values.color, newWikiURL, values.parentname, iconUrl],
            religionGeneral: [values.name, values.color, newWikiURL, iconUrl],
            capital: [values.url, iconUrl],
            province: [values.url, iconUrl]
          }

          const bodyToSend = {}
          const metadataItem = values.type
          const fMetadataEntity = (metadataItem === 'religionGeneral') ? ((this.props.metadata['religion'] || {})[metadataEntity] || {})[3] : metadataEntity
          bodyToSend['subEntityId'] = (redirect === 'edit') ? values.select || fMetadataEntity : '_' + values.name.replace(/ /g, '_')
          bodyToSend['nextBody'] = nextBodyByType[metadataItem]

          const token = localStorage.getItem('chs_token')
          fetch(properties.chronasApiHost + '/metadata/' + metadataItem + '/single', {
            method: 'PUT',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyToSend)
          })
          .then((res) => {
            if (res.status === 200) {
              this.setState({
                metaToUpdate: metadataItem,
                successFullyUpdated: true
              })
              this.props.showNotification((redirect === 'edit') ? 'Metadata successfully updated' : 'Metadata successfully added')
              if (redirect === 'edit') history.goBack()
              else {
                if (utilsQuery.getURLParameter('value')) history.push('/article')
                else history.push('/')
              }
            } else {
              this.setState({
                metaToUpdate: '',
                successFullyUpdated: false
              })
              this.props.showNotification((redirect === 'edit') ? 'Metadata not updated' : 'Metadata not added', 'warning')
            }
          })
        }).catch((err) => {
          this.props.showNotification((redirect === 'edit') ? 'Metadata not updated: invalid icon url.' : 'Metadata not added: invalid icon url', 'warning')
        })
      }
    })

  componentWillUnmount () {
    const { metaToUpdate } = this.state
    const { setModType, updateSingleMetadata } = this.props

    // only update relevant
    axios.get(properties.chronasApiHost + '/metadata/' + metaToUpdate)
      .then((metadata) => {
        updateSingleMetadata(metaToUpdate, metadata.data.data)
      })
      .then(() => {
        setModType('', [], metaToUpdate)
      })
      .catch((err) => setModType(''))
  }

  componentDidMount () {
    const { setModType, selectedItem, setModData } = this.props
    const selectedProvince = selectedItem.value
    if (selectedProvince) setModData([selectedProvince])
    setModType(TYPE_METADATA)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.modActive.data[0] !== nextProps.modActive.data[0]) { this.props.change('coo[0]', nextProps.modActive.data[0]) }
    if (this.props.modActive.data[1] !== nextProps.modActive.data[1]) { this.props.change('coo[1]', nextProps.modActive.data[1]) }
  }

  render () {
    const {
      basePath,
      children,
      invalid,
      record,
      resource,
      submitOnEnter,
      toolbar,
      version,
    } = this.props

    return (
      <form className='simple-form' style={styles.drawerForm}>
        <div style={styles.formStyle} key={version}>
          {Children.map(children, input => (
            <FormInput
              basePath={basePath}
              input={input}
              record={record}
              resource={resource}
            />
          ))}
        </div>
        {toolbar &&
        React.cloneElement(toolbar, {
          handleSubmitWithRedirect: this.handleSubmitWithRedirect,
          invalid,
          submitOnEnter,
        })}
      </form>
    )
  }
}

MetaForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
}

const enhance = compose(
  connect((state, props) => ({
    initialValues: getDefaultValues(state, props),
    modActive: state.modActive,
    selectedYear: state.selectedYear,
    selectedItem: state.selectedItem,
  }),
    {
      // crudUpdate: crudUpdateAction,
      setModType,
      setModData,
      updateSingleMetadata,
      showNotification
    }),
  reduxForm({
    form: 'record-form',
    enableReinitialize: true,
  }),
)
export default enhance(MetaForm)
