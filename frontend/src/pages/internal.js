
import * as React from "react";
import dynamic from 'next/dynamic'

import Navigation from "../components/Navigation";
import { SpaceBetween, Container, Header, AppLayout } from "@cloudscape-design/components";

const Insights = dynamic(() => import('../components/Insights'));

export default function Internal(events) {

    return (
        <>
            <AppLayout
                navigation={<Navigation />}
                toolsHide={true}
                content={
                    <SpaceBetween direction="vertical" size="s" >
                        <Container
                            header={
                                <Header
                                    variant="h2"
                                >
                                    Analytics
                                </Header>
                            }
                        >
                            View your interactions.
                        </Container>
                        <Insights />
                    </SpaceBetween>
                }
            />
        </>
    );
}
