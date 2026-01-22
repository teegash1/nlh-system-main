"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

interface BounceCardsProps {
  className?: string
  images?: string[]
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  easeType?: string
  transformStyles?: string[]
  enableHover?: boolean
}

export default function BounceCards({
  className = "",
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)",
  ],
  enableHover = false,
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const isMobile = (viewportWidth ?? containerWidth) < 640
  const availableWidth = viewportWidth
    ? Math.max(280, viewportWidth - 48)
    : containerWidth
  const effectiveWidth = isMobile
    ? Math.min(containerWidth, availableWidth)
    : containerWidth
  const effectiveHeight = isMobile
    ? Math.min(containerHeight, Math.round(effectiveWidth * 0.6))
    : containerHeight

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".card",
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [animationStagger, easeType, animationDelay])

  const scaleTransform = (transformStr: string, scale: number) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/
    const match = transformStr.match(translateRegex)
    if (!match) return transformStr
    const currentX = parseFloat(match[1])
    const scaledX = Math.round(currentX * scale)
    return transformStr.replace(translateRegex, `translate(${scaledX}px)`)
  }

  const activeTransforms = useMemo(() => {
    if (!isMobile) return transformStyles
    const scale = containerWidth > 0 ? effectiveWidth / containerWidth : 1
    return transformStyles.map((transform) =>
      scaleTransform(transform, scale)
    )
  }, [containerWidth, effectiveWidth, isMobile, transformStyles])

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr)
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)")
    }
    if (transformStr === "none") {
      return "rotate(0deg)"
    }
    return `${transformStr} rotate(0deg)`
  }

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/
    const match = baseTransform.match(translateRegex)
    if (match) {
      const currentX = parseFloat(match[1])
      const newX = currentX + offsetX
      return baseTransform.replace(translateRegex, `translate(${newX}px)`)
    }
    return baseTransform === "none"
      ? `translate(${offsetX}px)`
      : `${baseTransform} translate(${offsetX}px)`
  }

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)
    images.forEach((_, i) => {
      const selector = q(`.card-${i}`)
      gsap.killTweensOf(selector)

      const baseTransform = activeTransforms[i] || "none"

      if (i === hoveredIdx) {
        const noRotation = getNoRotationTransform(baseTransform)
        gsap.to(selector, {
          transform: noRotation,
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        })
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160
        const pushedTransform = getPushedTransform(baseTransform, offsetX)
        const distance = Math.abs(hoveredIdx - i)
        const delay = distance * 0.05

        gsap.to(selector, {
          transform: pushedTransform,
          duration: 0.4,
          ease: "back.out(1.4)",
          delay,
          overwrite: "auto",
        })
      }
    })
  }

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)
    images.forEach((_, i) => {
      const selector = q(`.card-${i}`)
      gsap.killTweensOf(selector)
      const baseTransform = activeTransforms[i] || "none"
      gsap.to(selector, {
        transform: baseTransform,
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      })
    })
  }

  const cardSize = useMemo(() => {
    const base = Math.round(effectiveWidth * 0.4)
    return Math.min(220, Math.max(140, base))
  }, [effectiveWidth])

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      ref={containerRef}
      style={{
        width: effectiveWidth,
        height: effectiveHeight,
        maxWidth: "100%",
      }}
    >
      {images.map((src, idx) => (
        <div
          key={idx}
          className={cn(
            "card absolute overflow-hidden rounded-[25px] border-4 border-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.35)]",
            `card-${idx}`
          )}
          style={{
            width: cardSize,
            height: cardSize,
            transform: activeTransforms[idx] ?? "none",
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
        >
          <img
            className="h-full w-full object-cover"
            src={src}
            alt={`card-${idx}`}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
