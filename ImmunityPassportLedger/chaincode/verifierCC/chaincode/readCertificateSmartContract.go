package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Certificate struct {
	HealthNumberHash       string `json:"healthNumberHash"`
	ImmunityDate           int    `json:"immunityDate"`
	ImmunityValidityInDays int    `json:"immunityValidityInDays"`
	Issuer                 string `json:"issuer"`
}

// ReadCertificate returns the certficate stored in the world state with given hash.
func (s *SmartContract) ReadCertificate(ctx contractapi.TransactionContextInterface, healthNumberHash string) (*Certificate, error) {
	certificateJSON, err := ctx.GetStub().GetState(healthNumberHash)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if certificateJSON == nil {
		return nil, fmt.Errorf("the certificate %s does not exist", healthNumberHash)
	}

	var certificate Certificate
	err = json.Unmarshal(certificateJSON, &certificate)
	if err != nil {
		return nil, err
	}

	return &certificate, nil
}

// CertificateExists returns true when certificate with given healthNumberHash exists in world state
func (s *SmartContract) CertificateExists(ctx contractapi.TransactionContextInterface, healthNumberHash string) (bool, error) {
	certificateJSON, err := ctx.GetStub().GetState(healthNumberHash)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return certificateJSON != nil, nil
}
