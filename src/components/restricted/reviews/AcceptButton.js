import React, { Component } from 'react';
;
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import { translate } from 'admin-on-rest';
import compose from 'recompose/compose';
import { reviewApprove as reviewApproveAction } from './reviewActions';

class AcceptButton extends Component {
    handleApprove = () => {
        const { reviewApprove, record } = this.props;
        reviewApprove(record.id, record);
    }

    render() {
        const { record, translate } = this.props;
        return record && record.status === 'pending' ? <FlatButton
            primary
            label={translate('resources.reviews.action.accept')}
            onClick={this.handleApprove}
            icon={<ThumbUp color="#4CAF50" />}
        /> : <span/>;
    }
}

const enhance = compose(
    translate,
    connect(null, {
        reviewApprove: reviewApproveAction,
    })
);

export default enhance(AcceptButton);
