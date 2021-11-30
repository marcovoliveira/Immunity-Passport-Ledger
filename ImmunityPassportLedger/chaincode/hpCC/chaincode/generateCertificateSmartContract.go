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

// Generate a new certificate
func (s *SmartContract) CreateCertificate(ctx contractapi.TransactionContextInterface, healthNumberHash string, immunityDate string, immunityValidityInDays int) error {
	isHealthOrg, org := isHealthOrganization(ctx)
	if !isHealthOrg {
		return fmt.Errorf("Authorization denied! %s does not have permission to invoke this chaincode", org)
	}

	exists, err := s.CertificateExists(ctx, healthNumberHash)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the certificate %s already exists", healthNumberHash)
	}

	certificate := Certificate{
		HealthNumberHash:       healthNumberHash,
		ImmunityDate:           immunityDate,
		ImmunityValidityInDays: immunityValidityInDays,
		Issuer:                 org,
	}
	certificateJSON, err := json.Marshal(certificate)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(healthNumberHash, certificateJSON)
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

func isHealthOrganization(ctx contractapi.TransactionContextInterface) (bool, string) {
	org, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		fmt.Errorf("failed to get client MSPID: %v", err)
	}
	if "HealthOrg" == org {
		return true, org
	}
	return false, org
}
