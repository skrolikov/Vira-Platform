import React from "react";
import { Flex } from "./Flex";
import { DesignProps } from "../types";

export interface LoaderProps {
  size?: number;
  design?: DesignProps;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 32,
  design,
}) => {
  const spinnerDesign: DesignProps = {
    width: size,
    radius: "radius.full",
    animation: "spin",
  };

  return (
    <Flex align="center" justify="center" design={design}>
      <div data-design={JSON.stringify(spinnerDesign)} />
    </Flex>
  );
};
