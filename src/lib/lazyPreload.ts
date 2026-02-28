import { lazy, ComponentType } from "react";

/**
 * Enhanced lazy loader that attaches a .preload() method to the component.
 * This allows us to manually trigger the fetching of the chunk before the component is rendered.
 */
export const lazyPreload = <T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
) => {
    const Component = lazy(importFn) as any;
    Component.preload = importFn;
    return Component as T & { preload: () => Promise<{ default: T }> };
};
