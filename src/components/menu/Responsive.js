/**
 * Created by aumann on 06.07.17.
 */
import React from 'react'
import withWidth from 'material-ui/utils/withWidth'

export const Responsive = ({ small, medium, large, width, ...rest }) => {
  // let component
  return medium

  // switch (width) {
  //   case 1:
  //     component = small || (medium || large)
  //     break
  //   case 2:
  //     component = medium || (large || small)
  //     break
  //   case 3:
  //     component = large || (medium || small)
  //     break
  //   default:
  //     throw new Error(`Unknown width ${width}`)
  // }
  // return React.cloneElement(component, rest)
}

export default withWidth()(Responsive)
