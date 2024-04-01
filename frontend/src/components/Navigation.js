import * as React from "react";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import Router from 'next/router'
import {useRouter} from "next/router";

export default function Navigation() {

    const router = useRouter()
    const [activeHref, setActiveHref] = React.useState(router.pathname);

    const onFollowHandler = e => {
        e.preventDefault();
        setActiveHref(e.detail.href);
        Router.push(e.detail.href)
    };

    return (
        <SideNavigation
        activeHref={activeHref}
        header={{ href: "/", text: "Internal" }}
        onFollow={e => onFollowHandler(e)}
        items={[
          { type: "link", text: "Insights", href: "/internal" },
        ]}
      />
    );
  }