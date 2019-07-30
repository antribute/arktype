import React, { FC } from "react"
import { Card, Header } from "redo-components"
import { Theme } from "@material-ui/core"
import { useTheme } from "@material-ui/styles"
import { motion, SVGMotionProps } from "framer-motion"

export const HeaderCard: FC = () => {
    return (
        <>
            <AnimatedLogo />
            <Header>Free automated testing that builds itself.</Header>
        </>
    )
}

const arrowAnimationProps: SVGMotionProps<SVGPathElement> = {
    initial: {
        pathLength: 0,
        opacity: 0
    },
    animate: {
        pathLength: 1,
        opacity: 1
    },
    transition: {
        delay: 0.5,
        duration: 0.2,
        easings: "easeIn"
    }
}

export const AnimatedLogo = () => {
    const {
        palette: {
            primary: { main },
            secondary: { main: secondary }
        }
    } = useTheme<Theme>()
    return (
        <motion.svg height="200" viewBox="0 0 1823 575">
            <motion.g
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="81.767"
            >
                <motion.path
                    id="r-main"
                    stroke={main}
                    d="M54.257 524.998V265.056c13.687-103.11 78.946-181.08 164.666-202.41 85.72-21.33 174.357 18.342 223.285 99.939"
                />
                <motion.path
                    id="r-arrow"
                    stroke={secondary}
                    {...arrowAnimationProps}
                    d="M353.388 162.585h88.82v-88.82"
                />
                <motion.path
                    id="e-main"
                    stroke={main}
                    d="M840.922 483.139a213.13 238.494 0 0 1-252.682-6.964 213.13 238.494 0 0 1-69.047-272.08A213.13 238.494 0 0 1 730.89 49.564 213.13 238.494 0 0 1 925.594 229.92"
                />
                <motion.path
                    id="e-cross"
                    stroke={secondary}
                    d="M605.77 228.02h226.6"
                />
                <motion.path
                    id="d-and-o-main"
                    stroke={main}
                    d="M1034.469 525.61c115.519-6.028 205.674-114.026 203.188-243.403-2.485-129.377-96.704-232.94-212.348-233.407M1555.956 48.729a192.044 192.044 0 0 0-56.073 8.531c-82.15 25.301-145.182 104.354-155.179 203.17-12.176 120.347 58.178 231.802 163.61 259.19 105.433 27.388 212.472-37.987 248.92-152.03 36.448-114.042-9.264-240.548-106.305-294.19"
                />
                <motion.path
                    id="d-cross"
                    stroke={secondary}
                    d="M1027.066 139.595V435.66"
                />
                <motion.path
                    id="o-arrow"
                    stroke={secondary}
                    {...arrowAnimationProps}
                    d="M1739.75 73.4h-88.82v88.82"
                />
            </motion.g>
        </motion.svg>
    )
}
