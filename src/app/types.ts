export enum SCENE_STAGE {
    PAUSED = 0,
    FIRST_MOVE = 1,
    SECOND_MOVE = 2,
    THIRD_MOVE = 3,
    DISPLAY = 4
}

export interface SceneStage {
    id: SCENE_STAGE,
    name: string,
    frames: number,
    millis: number
}

export interface SceneRectLines {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
