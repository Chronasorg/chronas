import React from 'react'
import { SelectInput, translate } from 'admin-on-rest'

import segments from './privileges'

const SegmentsInput = ({ translate, ...rest }) => (
  <SelectInput {...rest} choices={segments.map(segment => ({ id: segment.id, name: translate(segment.name) }))} />
)

const TranslatedSegmentsInput = translate(SegmentsInput)

TranslatedSegmentsInput.defaultProps = {
  addLabel: true,
  addField: true,
  source: 'groups',
}

export default TranslatedSegmentsInput
