"use client";

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  getDefaultColorTheme,
} from "@tldraw/tldraw";
import React from "react";

export type ApplicationShape = TLBaseShape<
  "application",
  {
    name: string;
    icons?: string[];
    w: number;
    h: number;
  }
>;

export class ApplicationShapeUtil extends BaseBoxShapeUtil<ApplicationShape> {
  static override type = "application" as const;

  override isAspectRatioLocked = () => true;
  override canResize = () => true;

  override getDefaultProps(): ApplicationShape["props"] {
    return {
      name: "New App",
      icons: [],
      w: 300,
      h: 150,
    };
  }

  /*override defaultStyle = {
    color: "black",
  };*/

  override component(shape: ApplicationShape) {
    const { name, icons = [], w, h } = shape.props;
    const color = "black";
    //const theme = getDefaultColorTheme();

    const limitedIcons = icons.length
      ? icons.slice(0, 4)
      : []
      /*[
          "https://cdn-icons-png.flaticon.com/512/732/732200.png",
          "https://cdn-icons-png.flaticon.com/512/732/732221.png",
          "https://cdn-icons-png.flaticon.com/512/732/732228.png",
          "https://cdn-icons-png.flaticon.com/512/732/732230.png",
        ];*/

    const iconSquareSize = w / 6;
    const iconImgSize = iconSquareSize * 0.66;
    const fontSize = h * 0.15;

    return (
      <HTMLContainer style={{ pointerEvents: "auto" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `2px solid`,
            borderRadius: 8,
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 8,
            boxSizing: "border-box",
            userSelect: "none",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize,
              color: "black",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {limitedIcons.map((iconUrl, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid black",
                  borderRadius: 4,
                  width: iconSquareSize,
                  height: iconSquareSize,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 4,
                  boxSizing: "border-box",
                }}
              >
                <img
                  draggable={false}
                  src={iconUrl}
                  alt={`icon-${i}`}
                  style={{
                    width: iconImgSize,
                    height: iconImgSize,
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override onResize = (shape : any, { scaleX }: any) => {
    return {
      ...shape,
      props: {
        ...shape.props,
        w: shape.props.w * scaleX,
        h: shape.props.h * scaleX,
      },
    };
  };
  override indicator(shape: ApplicationShape) {
    return null;
  }
  override canBind = () => true;
  //override isConnectable = () => true;

  /*override getBounds(shape: ApplicationShape) {
  return {
    x: 0,
    y: 0,
    width: shape.props.w,
    height: shape.props.h,
  }
}*/
}
