/* global data */
import FakeRest from 'fakerest';
import fetchMock from 'fetch-mock';
import { data } from './data';

export default () => {
    const restServer = new FakeRest.FetchServer('http://fakeapi');
    restServer.init(data);
    restServer.toggleLogging(); // logging is off by default, enable it
    fetchMock.mock('^http://fakeapi', restServer.getHandler()).spy()

    return () => fetchMock.restore();
};
