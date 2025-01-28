// In your component
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { accountService } from "@/services/accountService";
import { AccountType, AccountSubType, Account } from "@/types";

export function TestAccountCreate() {
  const { user } = useAuth();

  const createNewAccount = async () => {
    if (!user) return;

    try {
      const accountData: Omit<Account, "id" | "createdAt" | "updatedAt"> = {
        userId: user.uid,
        name: "Swati HDFC",
        currency: "INR",
        balance: 0,
        type: AccountType.MAIN,
        subType: AccountSubType.SAVINGS,
      };

      const accountId = await accountService.createAccount(accountData);
      console.log("Account created with ID:", accountId);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onClick={createNewAccount}>Create New Account</Button>;
}
