import React, { useEffect } from 'react';
import {
  AppLayout,
  ContentLayout,
  Header,
  SplitPanel,
} from "@cloudscape-design/components";

import { getPanelContentBody, getPanelContentHeader, useSplitPanel } from "../components/Panel";
import { generateMakePurchaseEvent, generateAddToCartEvent, getRandom, generateClickEvent } from "../utils/generate";
import { writeToKinesis } from '../utils/kinesis';
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const Navigation  = dynamic(() => import("../components/Navigation"));
const Overview  = dynamic(() => import("../components/Overview"));
const TopNav  = dynamic(() => import("../components/TopNav"));

import useEventStore from '../utils/store';

var sessionNumber = getRandom(8);

export default function Home() {

  const { data: session, status } = useSession()

  const { events, addEvent } = useEventStore();

  const handleUserChange = (user) => {
    setCartItems([]);
    handleChangePurchaseButtonText(false);
    setUser(user);
    sessionNumber = getRandom(8);
  }

  const [
    user,
    setUser
  ] = React.useState({ value: "taylor@example.com", label: "Taylor Smith" });

  useEffect(() => {
    sessionNumber = getRandom(8);
  }, []);

  const [
    selectedItems,
    setSelectedItems
  ] = React.useState([]);

  const [
    cartItems,
    setCartItems
  ] = React.useState([]);

  const [
    purchaseButtonText,
    setPurchaseButtonText
  ] = React.useState("Make Purchase");

  const handleChangePurchaseButtonText = (increment) => {
    if (increment) {
      setPurchaseButtonText(`Make Purchase (${cartItems.length + 1})`);
    } else {
      setPurchaseButtonText("Make Purchase");
    }
  };

  const handleAddToCart = async (item) => {
    setCartItems([...cartItems, item]);
    handleChangePurchaseButtonText(true);
    const event = generateAddToCartEvent(user.value, sessionNumber, item);
    addEvent(event);
    if (status == "authenticated") {
      writeToKinesis(session?.id_token, event);
      if (Math.random() > 0.8) {
        addEvent(event);
        writeToKinesis(session?.id_token, event);
      }
    }
  }

  const handleMakePurchase = () => {
    setCartItems([]);
    handleChangePurchaseButtonText(false);
    const event = generateMakePurchaseEvent(user.value, sessionNumber, cartItems);
    addEvent(event);
    if (status == "authenticated") {
      writeToKinesis(session?.id_token, event);
      if (Math.random() > 0.8) {
        addEvent(event);
        writeToKinesis(session?.id_token, event);
      }
    }
  };


  const handleChangeSelection = (selectedItems) => {
    setSelectedItems(selectedItems);
    const event = generateClickEvent(user.value, sessionNumber);
    addEvent(event);
    if (status == "authenticated") {
      writeToKinesis(session?.id_token, event);
      if (Math.random() > 0.8) {
        addEvent(event);
        writeToKinesis(session?.id_token, event);
      }
    }
  };

  const { splitPanelOpen, onSplitPanelToggle, splitPanelSize, onSplitPanelResize } = useSplitPanel(
    selectedItems
  );

  return (
    <>
      <div id="navbarheader" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
        <TopNav />
      </div>
      <AppLayout
        toolsHide={true}
        navigationHide={false}
        navigation={<Navigation />}
        content={
          <ContentLayout
            header={
              <Header>
                <a>MyWebshop</a>
              </Header>
            }
          >
            <Overview selectedItems={selectedItems} handleAddToCart={handleAddToCart} cartItems={cartItems} handleMakePurchase={handleMakePurchase} purchaseButtonText={purchaseButtonText} handleChangeSelection={handleChangeSelection} user={user} handleUserChange={handleUserChange} />
          </ContentLayout>
        }
        splitPanelOpen={splitPanelOpen}
        onSplitPanelToggle={onSplitPanelToggle}
        splitPanelSize={splitPanelSize}
        onSplitPanelResize={onSplitPanelResize}
        splitPanel={<SplitPanel header={getPanelContentHeader(selectedItems)}>{getPanelContentBody(selectedItems)}</SplitPanel>}
      />
    </>
  )
}
