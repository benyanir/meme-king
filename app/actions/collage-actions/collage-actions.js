
import collageConstants  from './collage-actions-constants';
const { SET_COLLAGE_STATE, ADD_OR_REMOVE_MEME_FROM_COLLAGE, RESET_COLLAGE_MEMES } = collageConstants;

export function setCollageMode({ isCollageMode }) {
    return  {
        type: SET_COLLAGE_STATE,
        payload: { isCollageMode }
    }
}

export function addOrRemoveMemeFromCollage({ meme }) {
    return  {
        type: ADD_OR_REMOVE_MEME_FROM_COLLAGE,
        payload: { meme }
    }
}

export function resetCollageMemes() {
    return  {
        type: RESET_COLLAGE_MEMES,
        payload: {}
    }
}
