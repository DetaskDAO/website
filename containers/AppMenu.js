// antd
import { Menu } from "antd";
import Link from "next/link";
// import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
// chain
import { useDisconnect } from "wagmi";

export default function AppMenu(params) {
  const { disconnect } = useDisconnect();
  const { t } = useTranslation("task");

  const signOut = () => {
    disconnect();
    history.go(0)
  };

  return (
    <Menu
      items={[
        {
          key: "1",
          icon: <img src="/icon/icon-myinfo.png" style={{ height: 16 }} />,
          label: (
            <Link href={{ pathname: "/myInfo" }}>
              {t("header.user1")}
            </Link>
          ),
        },
        { type: "divider" },
        {
          key: "2",
          icon: <img src="/icon/icon-post.png" style={{ height: 16 }} />,
          label: (
            <Link href={`/user/projects?w=issuer&bar=tasks`}>
              {t("header.user2")}
            </Link>
          ),
        },
        { type: "divider" },
        {
          key: "3",
          icon: <img src="/icon/icon-apply.png" style={{ height: 16 }} />,
          label: (
            <Link href={`/user/projects?w=worker&bar=apply`}>
              {t("header.user3")}
            </Link>
          ),
        },
        { type: "divider" },
        {
          key: "4",
          icon: <img src="/icon/icon-disconnect.png" style={{ height: 16 }} />,
          label: <p onClick={() => signOut()}>{t("header.disconnect")}</p>,
        },
      ]}
    />
  );
}
