import React from 'react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from 'material-ui/BottomNavigation'
import AddIcon from 'material-ui/svg-icons/content/add'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import AssignIcon from 'material-ui/svg-icons/editor/format-paint'
import BottomNavigationItem from '../../overwrites/BottomNavigationItem'

const AssignAddEditNavigation = ({ pathname = '' }) => {
  return <BottomNavigation
    // style={styles.articleHeader}
    // onChange={this.handleChange}
    selectedIndex={(pathname.indexOf("mod/areas") > -1) ? 0 : (pathname.indexOf("mod/metadata/create") > -1) ? 1 : 2}>
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/areas' />}
      label='Assign Area'
      icon={<AssignIcon />}
      // onClick={() => { this.select(5) }}
    />
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/metadata/create' />}
      label='Add Area Entity'
      icon={<AddIcon />}
      // onClick={() => { this.select(4) }}
    />
    <BottomNavigationItem
      className='bottomNavigationItem'
      containerElement={<Link to='/mod/metadata' />}
      label='Edit Area Entity'
      icon={<EditIcon />}
      // onClick={() => { this.select(5) }}
    />
  </BottomNavigation>
}

export default AssignAddEditNavigation
