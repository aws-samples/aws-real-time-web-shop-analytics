
import * as React from "react";

import { SpaceBetween, Container, Header, RadioGroup } from "@cloudscape-design/components";

import Insights from "./Insights";

export default function Internal(events) {

    return (
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
    );
}
