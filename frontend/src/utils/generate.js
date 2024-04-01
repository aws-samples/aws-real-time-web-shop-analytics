export function getRandom(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1).toString());
}

export function generateClickEvent(user, sessionNumber) {
    
    return {
        session_id: sessionNumber,
        user_id: user,
        product_id: '', 
        action_type: 'click', 
        date_time: new Date().valueOf()
    }
}

export function generateAddToCartEvent(user, sessionNumber, item) {
    
    return {
        session_id: sessionNumber,
        user_id: user,
        product_id: item.id, 
        action_type: 'add_to_cart', 
        date_time: new Date().valueOf()
    }
}

export function generateMakePurchaseEvent(user, sessionNumber, itemsInCart) {
    
    return {
        session_id: sessionNumber,
        user_id: user,
        product_id: itemsInCart.map((item) => item.id).join(','),
        action_type: 'purchase', 
        date_time: new Date().valueOf()
    }
}



