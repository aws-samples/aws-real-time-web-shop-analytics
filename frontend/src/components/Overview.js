
import * as React from "react";

import { Box, Link, SpaceBetween, Container, Header, RadioGroup, Select } from "@cloudscape-design/components";
import Button from "@cloudscape-design/components/button";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";


export default function Overview({ selectedItems, handleAddToCart, cartItems, handleMakePurchase, purchaseButtonText, handleChangeSelection, user, handleUserChange }) {

    return (
        <SpaceBetween direction="vertical" size="s" >
            <Container
                header={
                    <Header
                        variant="h2"
                        actions={
                            <Select
                                selectedOption={user}
                                onChange={({ detail }) => {
                                    handleUserChange(detail.selectedOption)
                                }}
                                options={[
                                    { value: "taylor@example.com", label: "Taylor Smith" },
                                    { value: "rose@example.com", label: "Rose Wilson" },
                                    { value: "jones@example.com", label: "Jones Baker" }
                                ]}
                            />
                        }
                    >
                        Welcome to MyWebshop!
                    </Header>
                }

            >
                Fair prices guaranteed!
            </Container>

            <Table
                onSelectionChange={({ detail }) =>
                    handleChangeSelection(detail.selectedItems)
                }
                selectedItems={selectedItems}
                ariaLabels={{
                    selectionGroupLabel: "Items selection",
                    allItemsSelectionLabel: ({ selectedItems }) =>
                        `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"
                        } selected`,
                    itemSelectionLabel: ({ selectedItems }, item) =>
                        item.name
                }}
                columnDefinitions={[
                    {
                        id: "name",
                        header: "Name",
                        cell: e => e.name,
                        sortingField: "name"
                    },
                    {
                        id: "price",
                        header: "Price",
                        cell: e => e.price,
                        sortingField: "price"
                    },
                    {
                        id: "category",
                        header: "Category",
                        cell: e => e.category
                    },
                    {
                        id: "description",
                        header: "Description",
                        cell: e => e.description
                    }
                ]}
                items={[
                    {
                        name: "Headphones Wireless 12.3",
                        id: "82312",
                        price: "$99.99",
                        description: "Wireless Headphones with Noise Cancelling in Black",
                        category: "Headphones",
                        image: "/headphones.png",
                        rating: "4/5"
                    },
                    {
                        name: "Surround Speaker AQ-87",
                        id: "63472",
                        price: "$359.99",
                        description: "Surround Speaker AQ-123 with WLAN, 2.0-System in Black",
                        category: "Speaker",
                        image: "/speaker.png",
                        rating: "4/5"
                    },
                    {
                        name: "Phillups OLED+907",
                        id: "23862",
                        price: "$999.99",
                        description: "Phillups OLED+907 4K OLED in Black",
                        category: "Video",
                        image: "/tv_4.png",
                        rating: "5/5"
                    },
                    {
                        name: "HDMI Cable",
                        id: "62432",
                        price: "$5.99",
                        description: "HDMI Cable (2m) in Black",
                        category: "Accessories",
                        image: "/hdmi.png",
                        rating: "2/5"
                    },
                    {
                        name: "Satuchi USB-C Multiport Pro Adapter",
                        id: "73421",
                        price: "$34.99",
                        description: "Satuchi USB-C Multiport Pro Adapter (Aluminium) with UBS-C delivery",
                        category: "Accessories",
                        image: "/adapter.png",
                        rating: "4/5"
                    },
                    {
                        name: "Canun Pusma TS1231 All-in-One Printer",
                        id: "57382",
                        price: "$129.99",
                        description: "Canun Pusma TS1231 All-in-One Printer with Duplex Mode",
                        category: "Office Electronics",
                        image: "/printer.png",
                        rating: "4/5"
                    },
                    {
                        name: "HU SmartPrinter 7623",
                        id: "73423",
                        price: "$129.99",
                        description: "HU SmartPrinter 7623 with Wireless All-in-One Printer",
                        category: "Office Electronics",
                        image: "/printer_2.png",
                        rating: "5/5"
                    },
                    {
                        name: "Phillups LED Smart TV",
                        id: "23862",
                        price: "$540.99",
                        description: "Phillups LED Smart TV 50 with Smart TV in Black",
                        category: "Video",
                        image: "/tv_1.png",
                        rating: "4/5"
                    },
                    {
                        name: "LJ Full HD TV",
                        id: "23869",
                        price: "$540.99",
                        description: "LJ Full HD TV with Size 43 in Black",
                        category: "Video",
                        image: "/tv_2.png",
                        rating: "3/5"
                    },
                    {
                        name: "LJ OLED TV",
                        id: "23865",
                        price: "$869.99",
                        description: "LJ OLED with Size 65 and Smart TV (Year 2023)",
                        category: "Video",
                        image: "/tv_3.png",
                        rating: "5/5"
                    }
                ]}
                loadingText="Loading resources"
                selectionType="single"
                trackBy="name"
                header={
                    <Header
                        actions={
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button onClick={() => handleAddToCart(selectedItems[0])}
                                >
                                    Add to Cart
                                </Button>
                                <Button variant="primary"
                                    disabled={!cartItems.length}
                                    onClick={() => handleMakePurchase()}>
                                    {purchaseButtonText}
                                </Button>
                            </SpaceBetween>
                        }
                    >
                        Available Products
                    </Header>
                }
                filter={
                    <TextFilter
                        filteringPlaceholder="Search"
                        filteringText=""
                    />
                }
                footer={
                    <Box textAlign="center">
                        <Link href="#">End</Link>
                    </Box>
                }
                preferences={
                    <CollectionPreferences
                        title="Preferences"
                        confirmLabel="Confirm"
                        cancelLabel="Cancel"
                        preferences={{
                            pageSize: 20,
                            visibleContent: [
                                "variable",
                                "value",
                                "type",
                                "description"
                            ]
                        }}
                    />
                }
            />
        </SpaceBetween>
    )
}