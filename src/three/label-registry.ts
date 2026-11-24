/**
 * DOM label elements rendered by StoryCanvas (outside the WebGL canvas) and
 * positioned every frame by the assembly that owns the anchors. Replaces
 * drei <Html>, whose nested React roots unmount mid-render under React 19.
 */
export const labelElements: Array<HTMLDivElement | null> = [];
