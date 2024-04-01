import React from 'react';
import TopNav from "../components/TopNav";
import Navigation from "../components/Navigation";
import { AppLayout, BreadcrumbGroup, ContentLayout } from "@cloudscape-design/components";
import { useSession } from "next-auth/react";
import { Heading } from "../components/Heading";
import dynamic from "next/dynamic";

const Userprofile = dynamic(() => import('../components/Userprofile'));

export default function Profile() {

    const {data: session, status} = useSession()

    if (status === 'authenticated') {
        return (
            <>
                <div id="navbarheader" style={{position: 'sticky', top: 0, zIndex: 1002}}>
                    <TopNav/>
                </div>
                <AppLayout
                    content={
                        <ContentLayout header={
                            <Heading
                                title="Profile"
                            />
                        }>
                            <form>
                                <Form>
                                    <Container>
                                        <SpaceBetween direction="vertical" size="m">
                                            <FormField label="Email">
                                                <Input
                                                    value={session.user.email}
                                                    readOnly
                                                    disabled
                                                />
                                            </FormField>
                                        </SpaceBetween>
                                    </Container>
                                </Form>
                            </form>
                        </ContentLayout>
                    }
                    navigation={<Navigation noNavigationItems={false}/>}
                    headerSelector="#navbarheader"
                    toolsHide={true}
                />
            </>
        )
    }
    if (status === 'unauthenticated') {
        return (
            <>
                <div id="navbarheader" style={{position: 'sticky', top: 0, zIndex: 1002}}>
                    <TopNav/>
                </div>
                <AppLayout
                    content={
                        <SpaceBetween size="xl" direction="vertical">
                            <Header/>
                            <Alert
                                dismissAriaLabel="Close alert"
                                type="error"
                                header="Please sign in to use this page"
                            >
                                This page can only used by authenticated users
                            </Alert>
                        </SpaceBetween>
                    }
                    navigation={<Navigation/>}
                    headerSelector="#navbarheader"
                    toolsHide={true}
                />
            </>
        )
    }
}


