import axios from 'axios';
import properties from "../../../../../../properties";

export const getAdminDashboardInfoAPI = () => {
  return (axios.get(properties.chronasApiHost + '/board/admin/admin_dashboard_info'), { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}});
};

export const createForumAPI = (forum_obj) => {
  return (axios.post(properties.chronasApiHost + '/board/admin/create_forum', forum_obj, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}}));
};

export const deleteForumAPI = (forum_id) => {
  return (axios.post(properties.chronasApiHost + '/board/admin/delete_forum', { forum_id }, { 'headers': { 'Authorization': 'Bearer ' + localStorage.getItem('token')}}));
};
