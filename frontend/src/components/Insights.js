import * as React from "react";
import { useState } from "react";
import {
    Box,
    Table
} from "@cloudscape-design/components";

import useEventStore from '../utils/store';

export default function Insights() {

    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const events = useEventStore((state) => state.events);

    return (

        <Table
            onSelectionChange={({ detail }) =>
                setSelectedItems(detail.selectedItems)
            }
            selectedItems={selectedItems}
            ariaLabels={{
                selectionGroupLabel: "Items selection",
                allItemsSelectionLabel: ({ selectedItems }) =>
                    `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "items"
                    } selected`,
                itemSelectionLabel: ({ selectedItems }, item) => {
                    const isItemSelected = selectedItems.filter(
                        i => i.name === item.name
                    ).length;
                    return `${item.name} is ${isItemSelected ? "" : "not"
                        } selected`;
                }
            }}
            visibleColumns={[
                "session_id",
                "user_id",
                "product_id",
                "action_type",
                "date_time"
            ]}
            columnDefinitions={[
                {
                    id: "session_id",
                    header: "Session ID",
                    cell: e => e.session_id,
                    sortingField: "session_id"
                },
                {
                    id: "user_id",
                    header: "User ID",
                    cell: e => e.user_id,
                    sortingField: "user_id"
                },
                {
                    id: "product_id",
                    header: "Product ID",
                    cell: e => e.product_id,
                    sortingField: "product_id"
                },
                {
                    id: "action_type",
                    header: "Action Type",
                    cell: e => e.action_type,
                    sortingField: "action_type"
                },
                {
                    id: "date_time",
                    header: "Date Time",
                    cell: e => e.date_time,
                    sortingField: "date_time"
                }
            ]}
            items={events}
            selectionType="multi"
            trackBy="partitionKey"
            empty={
                <Box textAlign="center" color="inherit">
                    <b>No events</b>
                    <Box
                        padding={{ bottom: "s" }}
                        variant="p"
                        color="inherit"
                    >
                        No events to display.
                    </Box>
                </Box>
            }
            variant="full-page"
        />
    );
}