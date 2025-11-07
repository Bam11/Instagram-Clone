import React, { useCallback, useState } from 'react'
import { FaArrowLeft, FaLongArrowAltLeft, FaSearchPlus } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/authContext';
import supabase from '~/lib/supabase';
import { useDropzone } from 'react-dropzone';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { post } from '~/lib/types';
import { CiFaceSmile } from 'react-icons/ci';
import Cropper from 'react-easy-crop';


export default function CreatePost() {
  //cropping setup
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | undefined>("");

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, [])



  const [isopen, setisopen] = useState(false);
  const [uplodedImageUrl, setuplodedImageUrl] = useState<string | null>(null); 
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dataURL, setDataURL] = useState<string | ArrayBuffer | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedSettings, setadvancedSettings] = useState({
    hideLikes: false,
    turnOffComments: false,
    shareToFacebook: false,
  });
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >([]);

  //cropping
  const createCroppedImage = useCallback(async () => {
    if(!file) return;
    try {
      const croppedImg = await getCroppedImg(
        URL.createObjectURL(file),
        croppedAreaPixels,
      );
      setCroppedImage(croppedImg);
      console.log("croppedImg", croppedImg)
    } catch (e) {
      console.error('Error creating cropped image:', e);
    }
  }, [croppedAreaPixels, file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setStep(2);
    }
  };

  function sanitizeFilename(filename: string) {
    return filename
      // Replace any invalid character with "_"
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      // Collapse multiple underscores
      .replace(/_+/g, "_")
      // Trim underscores at start/end
      .replace(/^_+|_+$/g, "");
  }

  // //Drag and drop
  // const onDrop = useCallback((acceptedFiles: any) => {
  //   acceptedFiles.forEach((file: any) => {
  //     const reader = new FileReader()
  //     reader.onload = () => {
  //       const binaryStr = reader.result
  //       setDataURL(binaryStr)
  //     }
  //     // reader.file;
  //   })
  // }, [])

  // const {
  //   getRootProps,
  //   acceptedFiles,
  //   getInputProps,
  //   isDragActive,
  // } = useDropzone({ onDrop })

  // const selectedFile = acceptedFiles[0]
  // console.log(selectedFile);

  const handleShare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !file) return alert("Please fill in all fields");
    setLoading(true);
    try {
      let mediaUrl = "";

      if(!file){
        alert("Please Selct a File");
        setLoading(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${sanitizeFilename(fileName)}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ic_posts")
        .upload(filePath, file);
        console.log("filepath", filePath);

      if (uploadError || !uploadData.path) {
        console.log("uploadError", uploadError);
        setLoading(false);
        return alert("media not found");
      };

      const {
        data: { publicUrl },
      } = supabase.storage.from("ic_posts").getPublicUrl(uploadData.path);
      console.log("mediaURL",mediaUrl);
      mediaUrl = publicUrl;

      if (!mediaUrl) {
        setLoading(false);
        return alert("Failed to upload media")
      };

      const newPost : Partial<post> = {
        author_id: user.id,
        caption,
        media: mediaUrl,
        media_type: file.type.startsWith("image/") ? "image" : "video",
        advanced_settings: advancedSettings,
      };

      const { error } = await supabase
        .from("post")
        .insert([newPost]);
        
      if (error) {
        console.error(error);
        alert("Error Inserting Posts");
      } else {
        alert("Post created successfully");
        // invite collaborators
        if (selectedCollaborators.length > 0) {
          const { error } = await supabase.from("ic_post_collaborators").insert(
            selectedCollaborators.map((collaborator) => ({
              post_id: newPost.id,
              collaborator_id: collaborator.id,
            }))
          );
          if (error) {
            console.error(error);
            alert(error.message);
          }
        }

        resetForm();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  function resetForm() {
    setisopen(false);
    setFile(null);
    setCaption("");
    setSelectedCollaborators([]);
    setadvancedSettings({
      hideLikes: false,
      turnOffComments: false,
      shareToFacebook: false,
    });
    navigate("/");
  }

  

  return (
    <>
      <button
        className="flex cursor-pointer items-center gap-4 p-3 font-normal hover:bg-[#DBDBDB] rounded-lg w-full outline-none"
        onClick={() => setisopen(true)}
      >
        <svg
          aria-label="New post" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>New post</title><path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
        </svg>
        <span>Create</span>
      </button>

      {isopen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setisopen(false)}
          />

          <div className="absolute top-5 right-5 cursor-pointer"
            onClick={() => setisopen(false)}
          >
            <IoCloseSharp size={25} className="text-white" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[450px] max-w-[70%] h-[65%]"> {/** "review later" relative to the image */}
            {(step === 1 && !file) && (
              <>
                <div className="bg-white rounded-t-4xl py-2">
                  <p className="text-center text-lg font-semi-bold">
                    Create new post
                  </p>
                </div>
                <div className="bg-white dark:bg-[#262626] rounded-b-4xl flex justify-center items-center w-full h-full" /*{...getRootProps()}*/>
                  <input
                    // {...getInputProps()}
                    type="file"
                    accept="image/*,video/*"
                    placeholder="add an image or a video"
                    hidden
                    id="fileinput"
                    onChange={handleFileChange}
                  />
                  
                    <div>
                      <label htmlFor="fileinput" className="">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <svg
                            aria-label="Icon to represent media such as images or videos" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="77" role="img" viewBox="0 0 97.6 77.3" width="96"><title>Icon to represent media such as images or videos</title><path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path><path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" fill="currentColor"></path><path d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z" fill="currentColor"></path>
                          </svg>
                          <p className="text-lg">
                            Drag photos and videos here
                          </p>
                          <div className="text-white py-1 px-4 rounded-lg cursor-pointer bg-[#4a5ef9] hover:bg-[#293edd]">
                            Select from computer
                          </div>
                        </div>
                      </label>
                    </div>
                


                </div>
              </>
            )}
            {(step === 2 || step === 3) && file && (
              <>
                <div className="flex justify-between items-center bg-white rounded-t-4xl py-2">
                  <button className="dark:text-white py-1 px-4 rounded-lg cursor-pointer"
                    onClick={() => {
                      if (step === 3) {
                        setStep(2);
                      } else {
                        setStep(1);
                        setFile(null);
                      }
                    }}
                  >
                    <FaLongArrowAltLeft size={24} />
                  </button>
                  <p className="text-center text-lg font-semi-bold">
                    {step === 2 ? "Crop" : "Create new post"}
                  </p>
                  <button className="py-1 px-4 rounded-lg text-[#2536d0] cursor-pointer"
                    type={step === 3 ? "submit" : "button"}
                    form={step === 3 ? "createPostForm" : undefined}
                    onClick={() => {
                      if (step === 2) {
                        setStep(3);
                      }
                    }}
                  >
                    {step === 2 ? "Next" : "share"}
                  </button>
                </div>

                <form id="createPostForm"
                  onSubmit={handleShare}
                  className="bg-white flex justify-center items-center w-full h-full rounded-b-4xl"
                > {!croppedImage ? 
                  (
                    <div className="flex size-full">
                      <div className="w-full relative rounded-4xl">
                        {/* <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-scale-down" //review later
                        /> */}
                        <Cropper
                          image={URL.createObjectURL(file)}
                          crop={crop}
                          zoom={zoom}
                          aspect={5 / 6}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />

                      </div>
                      <div className="absolute -bottom-10 left-20">

                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full h-[1px] bg-green rounded-lg appearance-none cursor-pointer"
                          style={{ background: "white" }}
                        />
                        <label className="bg-red-200/50 text-white size-[20px]">
                          <svg
                            aria-label="Select zoom" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height={16} role="img" viewBox="0 0 24 24" width={16}><title>Select zoom</title><path d="m22.707 21.293-4.825-4.825a9.519 9.519 0 1 0-1.414 1.414l4.825 4.825a1 1 0 0 0 1.414-1.414ZM10.5 18.001a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5Zm3.5-8.5h-2.5v-2.5a1 1 0 1 0-2 0v2.5H7a1 1 0 1 0 0 2h2.5v2.5a1 1 0 0 0 2 0v-2.5H14a1 1 0 0 0 0-2Z" />
                          </svg>

                          {/* className="bg-black/50 text-[50px] p-2 text-white font-normal rounded-full" Zoom: {zoom.toFixed(1)}x */}
                        </label>
                      </div>
                      <div className="absolute bottom-0 ">
                        <button
                          onClick={createCroppedImage}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          style={{ backgroundColor: '#3b82f6' }}
                        >
                          Crop
                        </button>
                      </div>
                    </div>
                ) : (
                     <div className="flex size-full">
                        <div className="w-full relative rounded-4xl">
                          <img
                            src={croppedImage}
                            alt="Cropped"
                          />
                        </div>
                      </div>
                )}
                  

                  {step === 3 && croppedImage && (
                    
                    <div className="min-w-[300px] max-w-[300px] border-l-[0.2px] border-[#969696] h-full dark:bg-[#262626] overflow-y-auto">
                      <div className="px-4 h-[60px] flex items-center gap-3">
                        <img
                          src={user?.user_metadata.image}
                          alt={user?.user_metadata.fullName}
                          className="size-8 rounded-full"
                        />
                        <p className="text-sm font-bold dark:white">
                          {user?.user_metadata.fullName}
                        </p>
                      </div>

                      <div className="">
                        <textarea
                          name=""
                          id=""
                          placeholder="Add a caption"
                          value={caption}
                          required
                          className="w-full p-4 h-[130px] outline-none resize-none"
                          onChange={(e) => {
                            if (!(e.target.value.length > 2200)) {
                              setCaption(e.target.value);
                            }
                          }}
                        />

                        <div className="flex justify-between items-center px-4 py-2 text-[#737373] border-b border-[#dbdbdb]">
                          <button
                            className="cursor-pointer"
                            type="button"
                          >
                            <CiFaceSmile size={18} className="text-gray-400" />
                          </button>
                          <span className="">{caption.length}/2,200</span>
                        </div>
                      </div>

                      <div>
                        {/* <Collaborators
                          selectedCollaborators={selectedCollaborators}
                          setSelectedCollaborators={setSelectedCollaborators}
                        /> */}

                        <div>
                          <button
                            type="button"
                            className="flex justify-between w-full font-semibold py-3 px-4"
                            onClick={() => {
                              setShowAdvancedSettings(!showAdvancedSettings)
                            }}
                          >
                            <span>Advanced Settings</span>
                            {showAdvancedSettings ?
                              (<FiChevronUp size={20} />) :
                              (<FiChevronDown size={20} />)
                            }
                          </button>

                          {showAdvancedSettings && (
                            <div className="space-y-5 py-2 ">
                              {[
                                {
                                  title: "Hide like and view counts on this post",
                                  description: (
                                    <>
                                      Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people's posts, go to your account settings.{" "}
                                      <a href="">
                                        Learn more
                                      </a>
                                    </>
                                  ),
                                  name: "hideLikes" as keyof typeof advancedSettings,
                                },
                                {
                                  title: "Turn off commenting",
                                  description:
                                    "You can change this later by going to the ··· menu at the top of your post.",
                                  name: "turnOffComments" as keyof typeof advancedSettings,
                                },

                                {
                                  title: "Automatically share to Facebook",
                                  description:
                                    "Always share your posts to Facebook. You can change your audience on Facebook settings. Learn more.",
                                  name: "shareToFacebook" as keyof typeof advancedSettings,
                                }
                              ].map((advS, index) => {
                                return (
                                  <div key={index} className="space-y-2">
                                    <div className="px-4 flex items-center justify-between gap-3">
                                      <span className="text-sm font-normal"
                                      >
                                        {advS.title}
                                      </span>
                                      <button
                                        type="button"
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedSettings[advS.name]
                                          ? "bg-black dark:bg-[]"
                                          : "bg-[#dbdfe4]"
                                          }`}
                                        onClick={() => {
                                          setadvancedSettings({
                                            ...advancedSettings,
                                            [advS.name]: !advancedSettings[advS.name]
                                          });
                                        }}
                                      >
                                        <span
                                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedSettings[advS.name]
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                            }`}
                                        />
                                      </button>
                                    </div>
                                    <p className="text-[#9e9e9e] text-xs px-4">
                                      {advS.description}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}


type Collaborator = {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
};

// function Collaborators({
//   selectedCollaborators,
//   setSelectedCollaborators,
// }: {
//   selectedCollaborators: Collaborator[];
//   setSelectedCollaborators: React.Dispatch<
//     React.SetStateAction<Collaborator[]>
//   >;
// }) 

//cropping
const createImage = (url:any) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
 
const getCroppedImg = async (imageSrc:string, pixelCrop:any, rotation = 0) => {
  const image: any = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
 
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
 
  // Set canvas dimensions to handle the rotation
  canvas.width = safeArea;
  canvas.height = safeArea;       
  if(!ctx)return;
 
  // Translate canvas center point to the origin
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
 
  // Draw the rotated image and drop off-canvas pixels
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
 
  // Extract the cropped portion
  const data = ctx.getImageData(0, 0, safeArea, safeArea);
 
  // Set canvas width to final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
 
  // Place the cropped data into a new canvas with proper position
  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );
 
  // Return as data URL
  return canvas.toDataURL('image/png');
};