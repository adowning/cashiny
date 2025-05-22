// // -------------------------------------------------------------------
// // 5. src/composables/useSupabaseAuth.ts
// // -------------------------------------------------------------------
// import { ref, onMounted, onUnmounted, computed } from "vue";
// import { supabase } from "../supabase"; // Ensure this path is correct
// import { useAuthStore } from "../stores/auth.store";
// import { useUserStore, type UserData } from "../stores/user.store";
// import { useProfileStore, type ProfileData } from "../stores/profile";
// import type {
//   AuthChangeEvent,
//   Session,
//   SignInWithPasswordCredentials,
//   SignUpWithPasswordCredentials,
//   Subscription,
//   User,
//   AuthError as SupabaseAuthError,
// } from "@supabase/supabase-js";
// import type { Database } from "../types/database.types"; // Import Database type
// import { uuid } from "@electric-sql/pglite";
// import { ProfileStatsUpdateData, UserStatsUpdateData } from "@cashflow/types";

// // Module-level counter to track how many times the composable function is invoked
// let composableInvocationCounter = 0;

// // Module-level variables to manage the single global auth subscription
// let globalAuthListener: Subscription | null = null;
// let activeComposableInstances = 0;

// export function useSupabaseAuth() {
//   composableInvocationCounter++;
//   const instanceId = composableInvocationCounter; // ID for this specific invocation

//   const authStore = useAuthStore();
//   const userStore = useUserStore();
//   const profileStore = useProfileStore();

//   const { setSession, setLoading, setError, setInitialAuthCheckComplete } =
//     authStore;

//   // Computed properties to reactively access store state
//   const session = computed(() => authStore.session);
//   const isAuthenticated = computed(() => !!authStore.session?.user);
//   const isLoading = computed(() => authStore.loading);
//   const authError = computed(() => authStore.error);
//   const currentUser = computed(() => userStore.currentUser);
//   const currentProfile = computed(() => profileStore.currentProfile);
//   const initialAuthCheckComplete = computed(
//     () => authStore.initialAuthCheckComplete
//   );

//   // Helper function to create public user and profile records
//   async function _createPublicUserAndProfile(
//     authUser: User,
//     providedUsername?: string,
//     providedAvatarUrl?: string
//   ): Promise<{
//     userData: UserData | null;
//     profileData: ProfileData | null;
//     error: any | null;
//   }> {
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): _createPublicUserAndProfile for user ${authUser.id}`
//     );

//     // For Google Sign-In, user_metadata often contains name and avatar_url
//     const username =
//       providedUsername ||
//       authUser.user_metadata?.full_name ||
//       authUser.user_metadata?.name ||
//       `user_${authUser.id.substring(0, 8)}`;
//     const avatar =
//       providedAvatarUrl ||
//       authUser.user_metadata?.avatar_url ||
//       authUser.user_metadata?.picture; // Google often uses 'picture'
//     const email = authUser.email;

//     if (!email) {
//       const missingEmailError = {
//         message:
//           "Email is missing from auth user data, cannot create public user.",
//       };
//       console.error(missingEmailError.message);
//       return { userData: null, profileData: null, error: missingEmailError };
//     }
//     // Step 2.1: Create a record in the public.user table
//     const publicUserInsertData: Database["public"]["Tables"]["user"]["Insert"] =
//       {
//         id: authUser.id,
//         email: email,
//         username: username,
//         avatar: avatar,
//         // Initialize other fields as necessary, e.g., displayUsername: username
//       };
//     console.log(publicUserInsertData);

//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Attempting to insert into public.user:`,
//       publicUserInsertData
//     );
//     const { data: publicUserRecord, error: publicUserError } = await supabase
//       .from("user")
//       .insert(publicUserInsertData)
//       .select()
//       .single();

//     if (publicUserError) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Error creating public user record for ${authUser.id}:`,
//         publicUserError
//       );
//       return { userData: null, profileData: null, error: publicUserError };
//     }
//     if (!publicUserRecord) {
//       const noRecordError = {
//         message: "Public user record not returned after insert.",
//       };
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): ${noRecordError.message}`
//       );
//       return { userData: null, profileData: null, error: noRecordError };
//     }
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Public user record created for ${authUser.id}:`,
//       publicUserRecord
//     );
//     const profileId = uuid();
//     // Step 2.2: Create a record in the public.profiles table
//     const profileInsertData: Database["public"]["Tables"]["profiles"]["Insert"] =
//       {
//         id: authUser.id,
//         userId: authUser.id,
//         shopId: "cmah6pw5o000ccush47lv2jg4", // TODO: Replace with actual shopId logic from your application
//         balance: 0,
//         currency: "USD", // Default currency
//         xpEarned: 0,
//         isActive: true,
//         // Add other default fields for your 'profiles' table
//       };

//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Attempting to insert into public.profiles for user ${authUser.id}:`,
//       profileInsertData
//     );
//     const { data: profileRecord, error: profileError } = await supabase
//       .from("profiles")
//       .insert(profileInsertData)
//       .select()
//       .single();

//     if (profileError) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Error creating profile record for ${authUser.id}:`,
//         profileError
//       );
//       return {
//         userData: publicUserRecord as UserData,
//         profileData: null,
//         error: profileError,
//       };
//     }
//     if (!profileRecord) {
//       const noProfileRecordError = {
//         message: "Profile record not returned after insert.",
//       };
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): ${noProfileRecordError.message}`
//       );
//       return {
//         userData: publicUserRecord as UserData,
//         profileData: null,
//         error: noProfileRecordError,
//       };
//     }
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Profile record created for ${authUser.id}:`,
//       profileRecord
//     );

//     // Step 2.3: Update the public.user record with activeProfileId
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Attempting to update public.user ${authUser.id} with activeProfileId ${profileRecord.id}`
//     );
//     const { data: updatedUserRecord, error: updateUserError } = await supabase
//       .from("user")
//       .update({ activeProfileId: profileRecord.id })
//       .eq("id", authUser.id)
//       .select()
//       .single();

//     if (updateUserError) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Error updating user ${authUser.id} with activeProfileId:`,
//         updateUserError
//       );
//       return {
//         userData: publicUserRecord as UserData,
//         profileData: profileRecord as ProfileData,
//         error: updateUserError,
//       };
//     }
//     if (!updatedUserRecord) {
//       const noUpdatedUserError = {
//         message:
//           "Updated user record not returned after setting activeProfileId.",
//       };
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): ${noUpdatedUserError.message}`
//       );
//       return {
//         userData: publicUserRecord as UserData,
//         profileData: profileRecord as ProfileData,
//         error: noUpdatedUserError,
//       };
//     }
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): User record updated with activeProfileId for ${authUser.id}:`,
//       updatedUserRecord
//     );

//     return {
//       userData: updatedUserRecord as UserData,
//       profileData: profileRecord as ProfileData,
//       error: null,
//     };
//   }

//   // Fetches public user data from the 'user' table
//   async function fetchPublicUserData(userId: string): Promise<UserData | null> {
//     if (!userId) return null;
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Fetching public user data for ${userId}`
//     );
//     try {
//       const { data, error } = await supabase
//         .from("user")
//         .select("*")
//         .eq("id", userId)
//         .single();

//       if (error) {
//         if (error.code !== "PGRST116") {
//           // PGRST116: no rows found
//           console.error(
//             `useSupabaseAuth (Invocation ID: ${instanceId}): Error fetching public user data:`,
//             error
//           );
//         }
//         return null;
//       }
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Public user data fetched successfully.`
//       );
//       return data as UserData;
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Exception fetching public user data:`,
//         e
//       );
//       return null;
//     }
//   }

//   // Fetches user profile data from the 'profiles' table
//   async function fetchUserProfile(
//     userId: string,
//     activeProfileId?: string | null
//   ): Promise<ProfileData | null> {
//     if (!userId) return null;
//     console.log(
//       `useSupabaseAuth (Invocation ID: ${instanceId}): Fetching user profile for ${userId}, activeProfileId: ${activeProfileId}`
//     );
//     try {
//       const fromProfiles = supabase.from("profiles");
//       const selectBuilder = fromProfiles.select<
//         "*",
//         Database["public"]["Tables"]["profiles"]["Row"]
//       >("*");

//       let queryPromise;

//       if (activeProfileId) {
//         queryPromise = selectBuilder
//           .eq("id", activeProfileId)
//           .eq("userId", userId)
//           .single();
//       } else {
//         console.warn(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): No activeProfileId provided for user ${userId}. Fetching first profile by userId.`
//         );
//         queryPromise = selectBuilder.eq("userId", userId).maybeSingle();
//       }

//       const { data, error } = await queryPromise;

//       if (error && error.code !== "PGRST116") {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Error fetching user profile:`,
//           error
//         );
//         return null;
//       }
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): User profile data fetched successfully.`
//       );
//       return data as ProfileData;
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Exception fetching user profile:`,
//         e
//       );
//       return null;
//     }
//   }

//   // This function handles auth state changes.
//   const handleAuthStateChange = async (
//     event: AuthChangeEvent,
//     session: Session | null
//   ) => {
//     console.log(`Global Auth Handler: Auth event received - ${event}`, session);

//     const currentAuthStore = useAuthStore();
//     const currentUserStore = useUserStore();
//     const currentProfileStore = useProfileStore();

//     currentAuthStore.setSession(session);
//     if (event !== "INITIAL_SESSION") {
//       currentAuthStore.setError(null);
//     }

//     switch (event) {
//       case "INITIAL_SESSION":
//       case "SIGNED_IN":
//         if (session?.user) {
//           currentAuthStore.setLoading(true);
//           let publicUserData = await fetchPublicUserData(session.user.id);
//           let profileDataToSet: ProfileData | null = null;
//           const { data: authData, error: authError } =
//             await supabase.auth.getUser();
//           //   if (authData.user !== null) {
//           // profileDataToSet = {
//           //   id: authData.user.id,
//           //   email: authData.user.email,
//           //   name: authData.user.user_metadata.name,
//           //   avatarUrl: authData.user.user_metadata.avatar_url,
//           //   bio: authData.user.user_metadata.bio,
//           //   }
//           //  if (authError !== null || authData.user === null) {
//           //    return currentAuthStore.setError(authError as any)
//           //  }

//           if (!publicUserData && authData.user !== null) {
//             console.log(
//               `Global Auth Handler: public.user record missing for ${session.user.id}. Attempting to create records...`
//             );
//             // For OAuth, user_metadata from Google is available on session.user
//             const creationResult = await _createPublicUserAndProfile(
//               session.user,
//               session.user.user_metadata?.full_name ||
//                 session.user.user_metadata?.name,
//               session.user.user_metadata?.avatar_url ||
//                 session.user.user_metadata?.picture
//             );

//             if (creationResult.error) {
//               console.error(
//                 `Global Auth Handler: Error creating records for new user ${session.user.id}:`,
//                 creationResult.error
//               );
//               currentAuthStore.setError(creationResult.error as any);
//               publicUserData = creationResult.userData;
//               profileDataToSet = creationResult.profileData;
//             } else {
//               publicUserData = creationResult.userData;
//               profileDataToSet = creationResult.profileData;
//               console.log(
//                 `Global Auth Handler: Records created successfully for ${session.user.id}.`
//               );
//             }
//           }

//           if (publicUserData) {
//             currentUserStore.setUser(publicUserData);
//             if (profileDataToSet) {
//               currentProfileStore.setProfile(profileDataToSet);
//             } else if (publicUserData.activeProfileId) {
//               const fetchedProfile = await fetchUserProfile(
//                 session.user.id,
//                 publicUserData.activeProfileId
//               );
//               currentProfileStore.setProfile(fetchedProfile || null);
//               const lobby = supabase.channel("lobby");
//               lobby.subscribe();
//               const presenceTrackStatus = await lobby.track({
//                 user:
//                   publicUserData.username || publicUserData.email.split("@")[0],
//                 online_at: new Date().toISOString(),
//               });
//               console.log(presenceTrackStatus);
//               const allChanges = supabase
//                 .channel("schema-db-changes")
//                 .on(
//                   "postgres_changes",
//                   {
//                     event: "*",
//                     schema: "public",
//                   },
//                   (payload) => {
//                     console.log("postgres_changes payload", payload);
//                     if (
//                       payload.eventType === "UPDATE" &&
//                       payload.table === "user"
//                     ) {
//                       const updateData = {
//                         totalXp: payload.new.totalXp,
//                         balance: payload.new.balance,
//                       };
//                       userStore.updateCurrentUser(updateData);
//                     }
//                     if (
//                       payload.eventType === "UPDATE" &&
//                       payload.table === "profiles"
//                     ) {
//                       const updateData: ProfileStatsUpdateData = {
//                         balance: payload.new.balance,
//                         createdAt: payload.new.createdAt,
//                         currency: payload.new.currency,
//                         id: payload.new.id,
//                         isActive: payload.new.isActive,
//                         lastPlayed: payload.new.lastPlayed,
//                         phpId: payload.new.phpId,
//                         shopId: payload.new.shopId,
//                         updatedAt: payload.new.updatedAt,
//                         userId: payload.new.userId,
//                         xpEarned: payload.new.xpEarned,
//                       };
//                       userStore.updateCurrentUserProfile(updateData);
//                     }
//                     /*
//                     {
//     "schema": "public",
//     "table": "user",
//     "commit_timestamp": "2025-05-10T05:49:04.879Z",
//     "eventType": "UPDATE",
//     "new": {
//         "accessToken": null,
//         "active": false,
//         "activeProfileId": "a9644fa5-20ad-47d0-b6f7-98d67461d74f",
//         "avatar": "https://lh3.googleusercontent.com/a/ACg8ocIO2WeWfygLcCyY5U-O5fXbm7qonbTxFTIKJpW4JI1Sc5jZK9mn=s96-c",
//         "balance": 0,
//         "banExpires": null,
//         "banReason": null,
//         "banned": null,
//         "cashtag": null,
//         "createdAt": "2025-05-10T04:57:47.988",
//         "displayUsername": "",
//         "email": "ashdowning@gmail.com",
//         "emailVerified": null,
//         "gender": null,
//         "id": "a9644fa5-20ad-47d0-b6f7-98d67461d74f",
//         "image": null,
//         "isOnline": null,
//         "isVerified": false,
//         "lastDailySpin": null,
//         "lastLogin": null,
//         "name": null,
//         "passwordHash": null,
//         "phpId": null,
//         "role": null,
//         "sbId": null,
//         "status": null,
//         "totalXp": 1,
//         "twoFactorEnabled": null,
//         "updatedAt": null,
//         "username": "Ash Downing",
//         "verificationToken": null,
//         "vipInfoId": null
//     },
//     "old": {
//         "id": "a9644fa5-20ad-47d0-b6f7-98d67461d74f"
//     },
//     "errors": null
// }
//     */
//                   }
//                 )
//                 .subscribe();
//             } else {
//               console.warn(
//                 `Global Auth Handler: User ${publicUserData.id} has no activeProfileId or profile fetch failed.`
//               );
//               currentProfileStore.clearProfile();
//             }
//           } else {
//             currentUserStore.clearUser();
//             currentProfileStore.clearProfile();
//           }
//           currentAuthStore.setLoading(false);
//         } else {
//           currentUserStore.clearUser();
//           currentProfileStore.clearProfile();
//         }
//         if (event === "INITIAL_SESSION") {
//           currentAuthStore.setInitialAuthCheckComplete(true);
//         }
//         break;

//       case "SIGNED_OUT":
//         currentUserStore.clearUser();
//         currentProfileStore.clearProfile();
//         currentAuthStore.setInitialAuthCheckComplete(true);
//         break;

//       case "TOKEN_REFRESHED":
//         console.log(`Global Auth Handler: Token refreshed. Session updated.`);
//         if (!session?.user) {
//           currentUserStore.clearUser();
//           currentProfileStore.clearProfile();
//           currentAuthStore.setInitialAuthCheckComplete(true);
//         }
//         break;

//       case "USER_UPDATED":
//         console.log(`Global Auth Handler: User updated event.`);
//         if (session?.user) {
//           currentAuthStore.setLoading(true);
//           const updatedPublicUserData = await fetchPublicUserData(
//             session.user.id
//           );
//           if (updatedPublicUserData) {
//             currentUserStore.setUser(updatedPublicUserData);
//             const userProfileData = await fetchUserProfile(
//               session.user.id,
//               updatedPublicUserData.activeProfileId
//             );
//             currentProfileStore.setProfile(userProfileData || null);
//           } else {
//             console.warn(
//               `Global Auth Handler: User ${session.user.id} updated, but failed to refetch public user data.`
//             );
//             currentUserStore.clearUser();
//             currentProfileStore.clearProfile();
//           }
//           currentAuthStore.setLoading(false);
//         }
//         break;

//       case "PASSWORD_RECOVERY":
//         console.log(
//           `Global Auth Handler: Password recovery event. User may need to sign in again.`
//         );
//         break;

//       default:
//         console.warn(
//           `Global Auth Handler: Unhandled auth event type - ${event}`
//         );
//     }
//   };

//   // Auth action: Sign in with password
//   async function signInWithPassword(
//     credentials: SignInWithPasswordCredentials
//   ) {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data, error } =
//         await supabase.auth.signInWithPassword(credentials);
//       if (error) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Sign in error:`,
//           error
//         );
//         setError(error);
//         setInitialAuthCheckComplete(true);
//         return { user: null, session: null, error };
//       }
//       return { user: data.user, session: data.session, error: null };
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Sign in exception:`,
//         e
//       );
//       const err = {
//         name: "SignInException",
//         message: e.message,
//       } as SupabaseAuthError;
//       setError(err);
//       setInitialAuthCheckComplete(true);
//       return { user: null, session: null, error: err };
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Auth action: Sign up a new user with email/password
//   async function signUpNewUser(credentials: SignUpWithPasswordCredentials) {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data: authData, error: authError } =
//         await supabase.auth.signUp(credentials);

//       if (authError) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Supabase auth sign up error:`,
//           authError
//         );
//         setError(authError);
//         return { user: null, session: null, error: authError };
//       }

//       if (!authData.user) {
//         const noUserError = {
//           name: "SignUpError",
//           message: "User not created in auth table despite no error.",
//         } as SupabaseAuthError;
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): ${noUserError.message}`
//         );
//         setError(noUserError);
//         return { user: null, session: null, error: noUserError };
//       }
//       //@ts-ignore
//       const usernameFromOptions = credentials.options?.data?.username as string;
//       const creationResult = await _createPublicUserAndProfile(
//         authData.user,
//         usernameFromOptions
//       );

//       if (creationResult.error) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Error in post-signup record creation for ${authData.user.id}:`,
//           creationResult.error
//         );
//         setError(creationResult.error as any);
//         if (creationResult.userData) userStore.setUser(creationResult.userData);
//         if (creationResult.profileData)
//           profileStore.setProfile(creationResult.profileData);
//         return {
//           user: authData.user,
//           session: authData.session,
//           error: creationResult.error as any,
//         };
//       }

//       userStore.setUser(creationResult.userData);
//       profileStore.setProfile(creationResult.profileData);
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Email/Pass user and profile creation process completed successfully for ${authData.user.id}.`
//       );

//       return { user: authData.user, session: authData.session, error: null };
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Unhandled exception during sign up process:`,
//         e
//       );
//       const exceptionError = {
//         name: "SignUpException",
//         message: e.message,
//       } as SupabaseAuthError;
//       setError(exceptionError);
//       return { user: null, session: null, error: exceptionError };
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Auth action: Sign in with Google ID Token (obtained from GIS)
//   async function signInWithGoogleIdToken(idToken: string) {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data, error } = await supabase.auth.signInWithIdToken({
//         provider: "google",
//         token: idToken,
//         // nonce: 'OPTIONAL_NONCE_IF_YOU_USED_ONE_WITH_GIS', // Only if you provided a nonce to GIS
//       });

//       if (error) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Google ID token sign in error:`,
//           error
//         );
//         setError(error);
//         return { user: null, session: null, error };
//       }
//       // onAuthStateChange will handle the SIGNED_IN event and subsequent data processing.
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Google ID token sign in successful, session:`,
//         data.session
//       );
//       return { user: data.user, session: data.session, error: null };
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Google ID token sign in exception:`,
//         e
//       );
//       const err = {
//         name: "GoogleIdTokenSignInException",
//         message: e.message,
//       } as SupabaseAuthError;
//       setError(err);
//       return { user: null, session: null, error: err };
//     } finally {
//       setLoading(false); // Ensure loading is false after attempt
//     }
//   }

//   // Auth action: Sign out
//   async function signOut() {
//     setLoading(true);
//     setError(null);
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Sign out error:`,
//           error
//         );
//         setError(error);
//         return { error };
//       }
//       return { error: null };
//     } catch (e: any) {
//       console.error(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Sign out exception:`,
//         e
//       );
//       const err = {
//         name: "SignOutException",
//         message: e.message,
//       } as SupabaseAuthError;
//       setError(err);
//       return { error: err };
//     } finally {
//       setLoading(false);
//     }
//   }
//   async function subscribeGlobalAuth() {
//     activeComposableInstances++;
//     console.log(
//       `useSupabaseAuth: Mounting (Invocation ID: ${instanceId}, Active Instances: ${activeComposableInstances}, Total Invocations: ${composableInvocationCounter})`
//     );
//     console.log(globalAuthListener);
//     if (!globalAuthListener || globalAuthListener === null) {
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): No global auth listener found. Creating one.`
//       );
//       authStore.setLoading(true);
//       console.log(`useSupabaseAuth auth loading`);
//       try {
//         // const {
//         //   data: { session: initialSessionData },
//         // } = await supabase.auth.getSession();
//         const initialSessionData = await authStore.dispatchGetSession();
//         console.log("initialSessionData", initialSessionData);
//         if (!initialSessionData && !authStore.initialAuthCheckComplete) {
//           console.log(
//             `useSupabaseAuth (Invocation ID: ${instanceId}): No initial session from getSession().`
//           );
//         }
//       } catch (e) {
//         console.error(
//           `useSupabaseAuth (Invocation ID: ${instanceId}): Error fetching initial session:`,
//           e
//         );

//       }
//       const {
//         data: { subscription },
//       } = supabase.auth.onAuthStateChange(handleAuthStateChange);
//       console.log(subscription);
//       globalAuthListener = subscription;
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Global auth listener subscribed.`
//       );
//     } else {
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): Global auth listener already exists.`
//       );
//       if (authStore.loading && authStore.initialAuthCheckComplete)
//         authStore.setLoading(false);
//     }
//   }
//   onMounted(async () => {
//     // activeComposableInstances++
//     // console.log(
//     //   `useSupabaseAuth: Mounting (Invocation ID: ${instanceId}, Active Instances: ${activeComposableInstances}, Total Invocations: ${composableInvocationCounter})`,
//     // )
//     // console.log(globalAuthListener)
//     // if (!globalAuthListener) {
//     //   console.log(
//     //     `useSupabaseAuth (Invocation ID: ${instanceId}): No global auth listener found. Creating one.`,
//     //   )
//     //   authStore.setLoading(true)
//     //   const {
//     //     data: { session: initialSessionData },
//     //   } = await supabase.auth.getSession()
//     //   if (!initialSessionData && !authStore.initialAuthCheckComplete) {
//     //     console.log(
//     //       `useSupabaseAuth (Invocation ID: ${instanceId}): No initial session from getSession().`,
//     //     )
//     //   }
//     //   const {
//     //     data: { subscription },
//     //   } = supabase.auth.onAuthStateChange(handleAuthStateChange)
//     //   console.log(subscription)
//     //   globalAuthListener = subscription
//     //   console.log(
//     //     `useSupabaseAuth (Invocation ID: ${instanceId}): Global auth listener subscribed.`,
//     //   )
//     // } else {
//     //   console.log(
//     //     `useSupabaseAuth (Invocation ID: ${instanceId}): Global auth listener already exists.`,
//     //   )
//     //   if (authStore.loading && authStore.initialAuthCheckComplete)
//     //     authStore.setLoading(false)
//     // }
//   });

//   onUnmounted(() => {
//     activeComposableInstances--;
//     console.log(
//       `useSupabaseAuth: Unmounting (Invocation ID: ${instanceId}, Active Instances: ${activeComposableInstances})`
//     );
//     if (activeComposableInstances === 0 && globalAuthListener) {
//       console.log(
//         `useSupabaseAuth (Invocation ID: ${instanceId}): All instances unmounted. Unsubscribing global auth listener.`
//       );
//       globalAuthListener.unsubscribe();
//       globalAuthListener = null;
//     }
//   });

//   return {
//     subscribeGlobalAuth,
//     session,
//     isAuthenticated,
//     isLoading,
//     authError,
//     currentUser,
//     currentProfile,
//     initialAuthCheckComplete,
//     signInWithPassword,
//     signUpNewUser,
//     signInWithGoogleIdToken, // Expose the new Google Sign-In function
//     signOut,
//     fetchPublicUserData,
//     fetchUserProfile,
//   };
// }
