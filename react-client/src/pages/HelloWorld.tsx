import React, { useEffect, useState } from "react";
import { Button } from "./button";
interface ApiResponse {
  message: string;
}
import { apiURL } from '../config';

const HelloWorldComponent: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);

  const postData = async () => {
    try {
      const response = await fetch("${apiURL}/api/handle_post/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Example",
          description: "This is a description",
        }),
      });

      const result: ApiResponse = await response.json();
      console.log(result);
      // You can update the UI or do additional handling based on the result here
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/api/hello/`);
        const data: ApiResponse = await response.json();
        setResponse(data.message);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <p>{response ? response : "Loading..."}</p>
      <Button onClick={postData}>Make that POST Request</Button>
    </div>
  );
};

export default HelloWorldComponent;
