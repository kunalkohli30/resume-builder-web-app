import type { Easing } from "framer-motion"

export const slideMenuFromUpToDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export const fadeInOutWithOpacity = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
}

export const slideUpDownWithScale = {
    initial: { opacity: 0, scale: .6, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: .6, y: -20 }
}

// animation to load all template pins on reloading home page
// The cards appear like zooming out to respective positions 
// and there is a delay which makes the cards zoom out sequentially one by one
export const scaleInOut = (index: number) => {
    return {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.85 },
        transition: { delay: index * 0.3, ease: 'easeInOut' }
    }
}


export const opacityINOut = (index: number) => {
    return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { delay: index * 0.1, ease: "easeInOut" } as {delay: number, ease: Easing | Easing[] | undefined},
    };
};
