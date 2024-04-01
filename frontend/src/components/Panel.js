import React, { useState, useEffect } from 'react';
import { Link, Box, Grid } from '@cloudscape-design/components';

export const useSplitPanel = selectedItems => {
    const [splitPanelSize, setSplitPanelSize] = useState(300);
    const [splitPanelOpen, setSplitPanelOpen] = useState(false);
    const [hasManuallyClosedOnce, setHasManuallyClosedOnce] = useState(false);

    const onSplitPanelResize = ({ detail: { size } }) => {
        setSplitPanelSize(size);
    };

    const onSplitPanelToggle = ({ detail: { open } }) => {
        setSplitPanelOpen(open);

        if (!open) {
            setHasManuallyClosedOnce(true);
        }
    };

    useEffect(() => {
        if (selectedItems.length && !hasManuallyClosedOnce) {
            setSplitPanelOpen(true);
        }
    }, [selectedItems.length, hasManuallyClosedOnce]);

    return {
        splitPanelOpen,
        onSplitPanelToggle,
        splitPanelSize,
        onSplitPanelResize,
    };
};

export const getPanelContentHeader = items => {
    if (!items.length) {
        return 'No product selected.'
    }
    const item = items[0];
    return item.name
};

export const getPanelContentBody = items => {
    if (!items.length) {
        return 'Select a product to view the details.';
    }
    const item = items[0];
    return (
        <Grid
            gridDefinition={[
                { colspan: 2 },
                { colspan: 4 },
                { colspan: 2 },
                { colspan: 2 },
                { colspan: 2 }
            ]}
        >
            <div>
                <Box variant="awsui-key-label"></Box>
                <img
                    src={item.image}
                    alt="Image"
                    width="30%"
                />
            </div>
            <div>
                <Box variant="awsui-key-label">Description</Box>
                <Link href="#">{item.description}</Link>
            </div>
            <div>
                <Box variant="awsui-key-label">Price</Box>
                <Link href="#">{item.price}</Link>
            </div>
            <div>
                <Box variant="awsui-key-label">Customer Rating</Box>
                <Link href="#">{item.rating}</Link>
            </div>
            <div>
                <Box variant="awsui-key-label">Category</Box>
                <Link href="#">{item.category}</Link>
            </div>
        </Grid>
    )
};
