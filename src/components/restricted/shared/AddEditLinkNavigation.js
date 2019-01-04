import React from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from 'material-ui/BottomNavigation'
import AddIcon from 'material-ui/svg-icons/content/add'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import LinkIcon from 'material-ui/svg-icons/content/link'
import BottomNavigationItem from '../../overwrites/BottomNavigationItem'

const AddEditLinkNavigation = ({ pathname = '' }) => {
  return <BottomNavigation
    // style={styles.articleHeader}
    // onChange={this.handleChange}
    selectedIndex={(pathname.indexOf('/create') > -1) ? 0 : (pathname.indexOf('/links') === -1) ? 1 : 2}>
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/markers/create' />}
      label='Add'
      icon={<AddIcon />}
      // onClick={() => { this.select(4) }}
    />
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/markers' />}
      label='Edit'
      icon={<EditIcon />}
      // onClick={() => { this.select(5) }}
    />
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/links' />}
      label='Link Articles'
      icon={<LinkIcon />}
      // onClick={() => { this.select(5) }}
    />
  </BottomNavigation>
}

export default AddEditLinkNavigation
