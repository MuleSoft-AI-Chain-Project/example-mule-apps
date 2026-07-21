import React, { useState, memo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "../icons/Icons";

const Accordion = memo(({
  title,
  children,
  icon: Icon,
  defaultOpen = false,
  isCollapsed = false,
  onCollapsedClick
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleClick = () => {
    if (isCollapsed && onCollapsedClick) {
      onCollapsedClick();
      setIsOpen(true);
    } else if (!isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`w-full my-2 rounded-lg ${isOpen ? "border border-blue-500 shadow-md" : ""}`}>
      <button
        aria-expanded={isOpen}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } py-3 text-gray-200 hover:bg-blue-500 rounded-lg ${
          isCollapsed ? "px-0" : "px-3"
        } ${isOpen ? "bg-blue-500" : "bg-gray-800/40"}`}
        onClick={handleClick}
      >
        <div className={`flex ${isCollapsed ? "justify-center w-full" : "items-center gap-3"}`}>
          <Icon className="h-6 w-6" />
          {!isCollapsed && <span className="text-[15px] font-medium">{title}</span>}
        </div>
        {!isCollapsed &&
          (isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          ))}
      </button>
      {!isCollapsed && isOpen && (
        <div className="py-4 space-y-4 px-3 bg-gray-800/40 rounded-b-lg">{children}</div>
      )}
    </div>
  );
});

export default Accordion;

