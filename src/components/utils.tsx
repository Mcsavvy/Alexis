import { IconType, IconBaseProps } from "react-icons";
import * as React from "react";

type HoverableIconProps = {
  icon: IconType;
  props: IconBaseProps;
  hoverProps?: IconBaseProps;
  hoverIcon?: IconType;
};

export function HoverableIcon({
  icon,
  props,
  hoverProps,
  hoverIcon,
}: HoverableIconProps) {
  const [hover, setHover] = React.useState(false);
  const Icon = hover ? hoverIcon || icon : icon;
  props = hover ? hoverProps || props : props;
  return (
    <Icon
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    />
  );
}
