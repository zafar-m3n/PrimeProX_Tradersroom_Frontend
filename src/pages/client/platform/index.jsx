import React from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import Icon from "@/components/ui/Icon";
import Heading from "@/components/ui/Heading";
import Notification from "@/components/ui/Notification";

const downloads = [
  {
    id: "windows",
    title: "Windows Desktop App",
    description: "Trade with full charting tools and fast execution on Windows.",
    icon: "mdi:windows",
    color: "text-blue-600",
    link: "/downloads/mt5managersetup.exe",
    button: "Download .exe",
  },
  {
    id: "android",
    title: "Android App",
    description: "Trade on the go with our mobile Meta5Pro app for Android.",
    icon: "mdi:android",
    color: "text-green-600",
    link: "/downloads/metatrader5.apk",
    button: "Download .apk",
  },
  {
    id: "web",
    title: "WebTrader",
    description: "No installation needed — trade directly in your browser.",
    icon: "mdi:web",
    color: "text-indigo-600",
    link: "https://terminal.tradepronet.com/",
    button: "Open WebTrader",
  },
];

const Platform = () => {
  const handleClick = (id, link, event) => {
    if (id === "web") {
      event.preventDefault();
      Notification.error("WebTrader is currently experiencing issues.");
    }
  };

  return (
    <DefaultLayout>
      <Heading>Download Our Trading Platform</Heading>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Choose the platform that best suits your trading style. Whether you're on desktop, mobile, or browser — we've
        got you covered.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {downloads.map(({ id, title, description, icon, color, link, button }) => (
          <div
            key={id}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-4 flex flex-col items-center justify-between text-center"
          >
            <Icon icon={icon} width={48} className={`${color} mb-4`} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
            <a
              href={link}
              target={id === "web" ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="bg-accent text-white px-4 py-2 rounded font-medium hover:bg-accent/90 transition"
              download={id !== "web"}
              onClick={(event) => handleClick(id, link, event)}
            >
              {button}
            </a>
          </div>
        ))}
      </div>
    </DefaultLayout>
  );
};

export default Platform;
