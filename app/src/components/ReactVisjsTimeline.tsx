import {
  Timeline as VisTimeline,
  DataGroupCollectionType,
  DataItemCollectionType,
  TimelineOptions,
} from "vis-timeline";
import "vis-timeline/dist/vis-timeline-graph2d.min.css";
import React from "react";

type VisEventCallback = (properties: any) => void;

const events = [
  "changed",
  "click",
  "contextmenu",
  "currentTimeTick",
  "doubleClick",
  "drop",
  "groupDragged",
  "itemout",
  "itemover",
  "mouseDown",
  "mouseMove",
  "mouseOver",
  "mouseUp",
  "rangechange",
  "rangechanged",
  "select",
  "timechange",
  "timechanged",
];

interface TimelineProps {
  options: TimelineOptions;
  items: DataItemCollectionType;
  groups?: DataGroupCollectionType;
  eventHandlers?: { [key: string]: VisEventCallback };
}

const Timeline: React.FC<TimelineProps> = ({
  options,
  items,
  groups,
  eventHandlers,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<VisTimeline | null>(null);
  const eventHandlersRef = React.useRef(eventHandlers);
  React.useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);
  const onEvent = React.useCallback((eventType, arg) => {
    let handlers = eventHandlersRef.current;
    if (handlers && eventType in handlers) {
      handlers[eventType](arg);
    }
  }, []);
  React.useEffect(() => {
    if (containerRef.current) {
      let timeline = timelineRef.current;
      if (!timeline) {
        timeline = new VisTimeline(containerRef.current, items, options);
        events.forEach(
          (eventType) =>
            timeline && timeline.on(eventType, (arg) => onEvent(eventType, arg))
        );
        timelineRef.current = timeline;
      } else {
        timeline.setOptions(options);
        timeline.setItems(items);
      }
      timeline.setGroups(groups);
    }
    return () => {
      if (timelineRef.current) {
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
    };
  }, [onEvent, items, options, groups, containerRef]);
  return <div ref={containerRef} />;
};

export default Timeline;
