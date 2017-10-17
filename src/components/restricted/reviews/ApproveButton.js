import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ThumbDown from 'material-ui/svg-icons/action/thumb-down';
import { reviewApprove as reviewApproveAction, reviewReject as reviewRejectAction } from './reviewActions';

class ApproveButton extends Component {
    handleApprove = () => {
        const { reviewApprove, record } = this.props;
        reviewApprove(record.id, record);
    }

    handleReject = () => {
        const { reviewReject, record } = this.props;
        reviewReject(record.id, record);
    }

    render() {
        const { record } = this.props;
        return (
            <span>
                <IconButton onClick={this.handleApprove} disabled={record.status === 'accepted'}><ThumbUp color="#00bcd4" /></IconButton>
                <IconButton onClick={this.handleReject} disabled={record.status === 'rejected'}><ThumbDown color="#00bcd4" /></IconButton>
            </span>
        );
    }
}

ApproveButton.propTypes = {
    record: PropTypes.object,
    reviewApprove: PropTypes.func,
    reviewReject: PropTypes.func,
};

export default connect(null, {
    reviewApprove: reviewApproveAction,
    reviewReject: reviewRejectAction,
})(ApproveButton);
