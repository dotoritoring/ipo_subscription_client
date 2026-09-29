'use client';

import { useEffect, useState } from "react";

export default function SubscriptionPage({params}){
    const {userId} = params;

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]= useState(null);

    useEffect(()=> {
        const fetchSubscriptions = async() => {
            try{
                
            }catch(error){

            }
        }
    }, []);
}