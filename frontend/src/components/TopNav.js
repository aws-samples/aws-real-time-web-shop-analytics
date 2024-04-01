import * as React from "react";

import { TopNavigation } from "@cloudscape-design/components";
import { useSession, signOut, signIn } from "next-auth/react";

export default function TopNav() {

    const {data: session, status} = useSession()


    if (status === "loading") {
        return (
            <TopNavigation
                identity={{
                    href: "/",
                    title: "AnyCompany"
                }}
            />
        )
    }

    if (status === "unauthenticated") {
        return (
            <TopNavigation
                identity={{
                    href: "/",
                    title: "AnyCompany"
                }}
                utilities={[
                    {
                        type: "button",
                        text: "Sign In",
                        external: false,
                        onClick: () =>
                            signIn('cognito', {
                                callbackUrl: window.location.href
                            })

                    },
                ]}
            />
        )
    }

    return (
        <TopNavigation
            identity={{
                href: "/",
                title: "AnyCompany"
            }}
            utilities={[
                {
                    type: "button",
                    text: [session?.user?.email],
                    iconName: "user-profile",
                    href: "/login"

                },
                {
                    type: "button",
                    text: "Sign Out",
                    external: false,
                    onClick: () =>
                        signOut( {
                            callbackUrl: window.location.origin
                        })

                },
            ]}
        />
    )

}