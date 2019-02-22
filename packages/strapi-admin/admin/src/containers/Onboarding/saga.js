import request from 'utils/request';
import { all, call, fork, takeLatest, put } from 'redux-saga/effects';

import { GET_VIDEOS } from './constants';
import { getVideosSucceeded } from './actions';

function* getVideos() {
  try {
    const videos = yield call(request, 'https://strapi.io/videos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
    },
    false,
    true,
    { noAuth: true },
    );

    let currTimes = Array.apply(null, Array(videos.length)).map((e, i) => {
      return {
        startTime: 0,
        end: false,
        key: i,
        id: videos[i].id,
      };
    });
    
    // Retrieve start time if enable in localStorage
    if (localStorage.getItem('videos')) {
      currTimes.splice(0, currTimes.length, ...JSON.parse(localStorage.getItem('videos')));
    } else {
      localStorage.setItem('videos', JSON.stringify(currTimes));
    }

    yield put(
      getVideosSucceeded(
        videos.map((video, index) => {
          video.isOpen = false;
          video.duration = null;
          video.startTime = currTimes[index].startTime;
          video.end = currTimes[index].end;

          return video;
        }).sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0)),
      ),
    );
  } catch (err) {
    console.log(err); // eslint-disable-line no-console
  }
}

function* defaultSaga() {
  yield all([fork(takeLatest, GET_VIDEOS, getVideos)]);
}

export default defaultSaga;
