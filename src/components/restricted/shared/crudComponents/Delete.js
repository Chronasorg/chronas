import React, { Component } from 'react'
;
import { connect } from 'react-redux'
import { Card, CardText, CardActions } from 'material-ui/Card'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'
import ActionCheck from 'material-ui/svg-icons/action/check-circle'
import AlertError from 'material-ui/svg-icons/alert/error-outline'
import compose from 'recompose/compose'
import inflection from 'inflection'
import { Title,
  ListButton,
  translate,
  crudGetOne as crudGetOneAction,
  crudDelete as crudDeleteAction,
  showNotification,
  ViewTitle
} from 'admin-on-rest'
import { logout } from '../../../menu/authentication/actionReducers'
import {setModType} from "../buttons/actionReducers";
import { TYPE_MARKER, deselectItem } from "../../../map/actionReducers";

const styles = {
  actions: { zIndex: 2, display: 'inline-block', float: 'right' },
  toolbar: { clear: 'both' },
  button: { margin: '10px 24px', position: 'relative' },
}

class Delete extends Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.goBack = this.goBack.bind(this)
  }

  componentWillMount () {
    if (this.props.resource === 'markers') this.props.setModType(TYPE_MARKER)
  }

  componentDidMount () {
    this.props.crudGetOne(
      this.props.resource,
      this.props.id,
      this.getBasePath()
    )
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id) {
      this.props.crudGetOne(
        nextProps.resource,
        nextProps.id,
        this.getBasePath()
      )
    }
  }

  getBasePath () {
    const { location } = this.props
    return location.pathname
      .split('/')
      .slice(0, -2)
      .join('/')
  }

  handleSubmit (event) {
    const { account, logout, resource, deselectItem, id, setModType, history, showNotification, crudDelete, data } = this.props
    event.preventDefault()

    setModType('metadata')
    crudDelete(
      resource,
      id,
      data,
      (resource === 'metadata') ? '/discover' : this.getBasePath()
    )
    if (account) {
      showNotification("auth.logged_out")
      logout()
    }
    else if (resource === 'markers') {
      showNotification("resources.markers.deleted")
      setModType('', [], data.type)
      deselectItem()
    }
    else if (resource === 'metadata') {
      showNotification("resources.metadata.deleted")
      setModType('', [], '')
      deselectItem()
    }
  }

  goBack () {
    this.props.history.goBack()
  }

  render () {
    const { title, id, data, isLoading, resource, translate } = this.props
    const basePath = this.getBasePath()

    const resourceName = translate(`resources.${resource}.name`, {
      smart_count: 1,
      _: inflection.humanize(inflection.singularize(resource)),
    })
    const defaultTitle = translate('aor.page.delete', {
      name: `${resourceName}`,
      id,
      data,
    })
    const titleElement = data ? (
      <Title title={title} record={data} defaultTitle={defaultTitle} />
    ) : (
      ''
    )

    return (
      <div>
        <Card style={{ opacity: isLoading ? 0.8 : 1 }}>
          <CardActions style={styles.actions}>
            {/*<ListButton basePath={basePath} />*/}
          </CardActions>
          <ViewTitle title={titleElement} />
          <form onSubmit={this.handleSubmit}>
            <CardText>
              {translate('aor.message.are_you_sure')}
            </CardText>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <RaisedButton
                  type='submit'
                  label={translate('aor.action.delete')}
                  icon={<ActionCheck />}
                  primary
                  style={styles.button}
                />
                <RaisedButton
                  label={translate('aor.action.cancel')}
                  icon={<AlertError />}
                  onClick={this.goBack}
                  style={styles.button}
                />
              </ToolbarGroup>
            </Toolbar>
          </form>
        </Card>
      </div>
    )
  }
}


function mapStateToProps (state, props) {
  return {
    id: props.match.params.id,
    data:
      state.admin.resources[props.resource].data[
        props.match.params.id
        ],
    isLoading: state.admin.loading > 0,
  }
}

const enhance = compose(
  connect(mapStateToProps, {
    crudGetOne: crudGetOneAction,
    crudDelete: crudDeleteAction,
    showNotification,
    deselectItem,
    setModType,
    logout
  }),
  translate
)

export default enhance(Delete)
