'use client'

import {
  HTMLContainer,
  ShapeUtil,
  TLBaseShape,
  getDefaultColorTheme,
  Rectangle2d,
} from '@tldraw/tldraw'
import React from 'react'

export type ApplicationShape = TLBaseShape<
  'application',
  {
    name: string
    icons?: string[]
    w: number
    h: number
  }
>

export class ApplicationShapeUtil extends ShapeUtil<ApplicationShape> {
  static override type = 'application' as const

  override isConnectable = () => true
  override canBind = () => true

  override isAspectRatioLocked = () => true
  override canResize = () => true

  override getDefaultProps(): ApplicationShape['props'] {
    return {
      name: 'New App',
      icons: [],
      w: 250,
      h: 100,
    }
  }

  override defaultStyle = {
    color: 'black',
  }

  override getBounds(shape: ApplicationShape) {
    return {
      x: 0,
      y: 0,
      width: shape.props.w,
      height: shape.props.h,
    }
  }

  override getGeometry(shape: ApplicationShape) {
    return new Rectangle2d({
      x: 0,
      y: 0,
      width: shape.props.w,
      height: shape.props.h,
    })
  }

  override getOutline(shape: ApplicationShape) {
    const { w, h } = shape.props
    const path = new Path2D()
    path.rect(0, 0, w, h)
    return path
  }

  override component(shape: ApplicationShape) {
    const { name, icons = [], w, h } = shape.props
    const color = shape.style?.color ?? 'black'
    const theme = getDefaultColorTheme({})

    const limitedIcons = icons.length
      ? icons.slice(0, 4)
      : [
          'https://cdn-icons-png.flaticon.com/512/732/732200.png',
          'https://cdn-icons-png.flaticon.com/512/732/732221.png',
          'https://cdn-icons-png.flaticon.com/512/732/732228.png',
          'https://cdn-icons-png.flaticon.com/512/732/732230.png',
        ]

    const iconSquareSize = w / 6
    const iconImgSize = iconSquareSize * 0.66
    const fontSize = h * 0.15

    return (
      <HTMLContainer
        id="application-shape"
        style={{
          width: w,
          height: h,
          pointerEvents: 'all',
        }}
      >
        <div
          data-shape-ui
          style={{
            width: '100%',
            height: '100%',
            border: `2px solid ${theme[color].solid}`,
            borderRadius: 8,
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 8,
            boxSizing: 'border-box',
            userSelect: 'none',
            pointerEvents: 'all',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize,
              color: theme[color].solid,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {limitedIcons.map((iconUrl, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid black',
                  borderRadius: 4,
                  width: iconSquareSize,
                  height: iconSquareSize,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 4,
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src={iconUrl}
                  alt={`icon-${i}`}
                  style={{
                    width: iconImgSize,
                    height: iconImgSize,
                    objectFit: 'contain',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: ApplicationShape) {
    const { w, h } = shape.props
    return (
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="none"
        stroke="none"
      />
    )
  }

  override onResize = (shape, { scaleX }) => {
    return {
      ...shape,
      props: {
        ...shape.props,
        w: shape.props.w * scaleX,
        h: shape.props.h * scaleX,
      },
    }
  }
}
