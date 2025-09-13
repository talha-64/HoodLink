import React from "react";

function AllPosts() {
  return <div>AllPosts</div>;
}

export default AllPosts;
// import { useState } from "react";
// import { Image, MapPin, Users } from "lucide-react";
// import { Button } from "./button";
// import { Input } from "./input";
// import { Label } from "./label";
// import { Textarea } from "./textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "./dialog";

// const CreatePostModal = ({ children }) => {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     content: "",
//     location: "",
//     tags: "",
//     privacy: "neighborhood",
//   });

//   const user = {
//     name: "Alex Johnson",
//     avatar: undefined,
//     neighborhood: "Oak Park",
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Post created:", formData);
//     setOpen(false);
//     setFormData({
//       content: "",
//       location: "",
//       tags: "",
//       privacy: "neighborhood",
//     });
//   };

//   const privacyOptions = [
//     { value: "neighborhood", label: "Neighborhood Only", icon: Users },
//     { value: "public", label: "Public", icon: Users },
//   ];

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create Post</DialogTitle>
//         </DialogHeader>

//         {/* User Info */}
//         <div className="flex items-center space-x-3 mb-6">
//           <Avatar className="w-12 h-12">
//             <AvatarImage src={user.avatar} alt={user.name} />
//             <AvatarFallback className="bg-community-primary text-white">
//               {user.name
//                 .split(" ")
//                 .map((n) => n.charAt(0))
//                 .join("")}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold text-foreground">{user.name}</h3>
//             <p className="text-sm text-muted-foreground">{user.neighborhood}</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Content */}
//           <div>
//             <Label htmlFor="content" className="text-foreground">
//               What's on your mind?
//             </Label>
//             <Textarea
//               id="content"
//               placeholder="Share something with your neighbors..."
//               value={formData.content}
//               onChange={(e) =>
//                 setFormData({ ...formData, content: e.target.value })
//               }
//               className="mt-2 min-h-32 resize-none"
//               required
//             />
//           </div>

//           {/* Location */}
//           <div>
//             <Label htmlFor="location" className="text-foreground">
//               Location (Optional)
//             </Label>
//             <div className="relative mt-2">
//               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//               <Input
//                 id="location"
//                 placeholder="Add a location..."
//                 value={formData.location}
//                 onChange={(e) =>
//                   setFormData({ ...formData, location: e.target.value })
//                 }
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           {/* Tags */}
//           <div>
//             <Label htmlFor="tags" className="text-foreground">
//               Tags (Optional)
//             </Label>
//             <Input
//               id="tags"
//               placeholder="Add tags separated by commas..."
//               value={formData.tags}
//               onChange={(e) =>
//                 setFormData({ ...formData, tags: e.target.value })
//               }
//               className="mt-2"
//             />
//             <p className="text-xs text-muted-foreground mt-1">
//               Examples: community, help-needed, event, recommendation
//             </p>
//           </div>

//           {/* Privacy Settings */}
//           <div>
//             <Label className="text-foreground">Who can see this post?</Label>
//             <div className="mt-2 space-y-2">
//               {privacyOptions.map((option) => (
//                 <label
//                   key={option.value}
//                   className="flex items-center space-x-3 cursor-pointer"
//                 >
//                   <input
//                     type="radio"
//                     name="privacy"
//                     value={option.value}
//                     checked={formData.privacy === option.value}
//                     onChange={(e) =>
//                       setFormData({ ...formData, privacy: e.target.value })
//                     }
//                     className="text-community-primary focus:ring-community-primary"
//                   />
//                   <option.icon className="w-4 h-4 text-muted-foreground" />
//                   <span className="text-foreground">{option.label}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Media Upload */}
//           <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
//             <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
//             <p className="text-muted-foreground mb-2">Add photos or videos</p>
//             <Button variant="outline" size="sm" type="button">
//               Choose Files
//             </Button>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
//             <Button variant="outline" className="flex-1" type="button">
//               Save as Draft
//             </Button>
//             <Button type="submit" className="flex-1 gradient-primary border-0">
//               Share Post
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreatePostModal;
