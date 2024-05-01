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



export function TimeAgo({ date }: { date: string}) {
  const [timeAgoText, setTimeAgoText] = React.useState('');

  function pluralizeTimeAgo(diff: number, unit: string) {
    return `${diff} ${unit}${diff > 1 ? 's' : ''} ago`;
  }

  const calculateTimeAgo = () => {
    const nowTs = new Date().getTime();
    const past = new Date(date.endsWith('Z') ? date : date + 'Z');
    // past.setTime(past.getTime() + past.getTimezoneOffset() * 60 * 1000);
    const pastTs = past.getTime();
    const diffInSeconds = Math.floor((nowTs - pastTs) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return pluralizeTimeAgo(diffInMinutes, 'minute');
    } else if (diffInHours < 24) {
      return pluralizeTimeAgo(diffInHours, 'hour');
    } else if (diffInDays < 7) {
      return pluralizeTimeAgo(diffInDays, 'day');
    } else {
      return past.toLocaleDateString();
    }
  };

  React.useEffect(() => {
    setTimeAgoText(calculateTimeAgo()); // Set initial state

    const interval = setInterval(() => {
      setTimeAgoText(calculateTimeAgo()); // Update state at each interval
    }, 60000); // Update every minute

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [date]); // Only rerun effect if the date prop changes

  return <>{timeAgoText}</>;
};

