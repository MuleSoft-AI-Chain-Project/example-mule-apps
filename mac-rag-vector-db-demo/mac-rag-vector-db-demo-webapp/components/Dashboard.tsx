"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatApp from "@/components/ChatApp";
import FileUploadDropzone from "@/components/Upload";
import { MessageSquare, Upload } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 w-full">
      <Card className="w-full min-w-[75%] max-w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desktop Layout */}
          <div className="hidden md:block space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    <Upload className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <FileUploadDropzone />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    <MessageSquare className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(50vh-4rem)] overflow-hidden">
                  <ChatApp />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Layout */}
          <Tabs defaultValue="chat" className="md:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <Card>
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      <MessageSquare className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[calc(70vh-4rem)] overflow-hidden">
                    <ChatApp />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <Card>
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      <Upload className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[calc(70vh-4rem)] overflow-auto">
                    <FileUploadDropzone />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
