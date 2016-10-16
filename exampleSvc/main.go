package main

import (
	"errors"
	"fmt"
	"net"
	"os"

	"golang.org/x/net/context"

	"google.golang.org/grpc"
)

func main() {
	svc := &Svc{}

	lis, err := net.Listen("tcp", "localhost:6565")
	if err != nil {
		fmt.Println("Unexpected err:", err)
		os.Exit(1)
	}

	srv := grpc.NewServer()

	RegisterExampleServiceServer(srv, svc)

	fmt.Println("Serving example grpc service:", lis.Addr().String())
	srv.Serve(lis)

}

type Svc struct {
}

//SayHello says the requested phrase
func (svc *Svc) SayHello(ctx context.Context, req *SayRequest) (*SayReply, error) {

	if req.SayWhat == "" {
		return nil, errors.New("Must request server to say something!")
	}

	if req.Recipient != nil {
		for i := 0; i < int(req.Recipient.NumberOfTimes); i++ {
			fmt.Printf("%s to %s - %d\n", req.SayWhat, req.Recipient.Name, i)
		}

		return &SayReply{
			SaidWhat: fmt.Sprintf("Server says, \"%s\" to %s, %d times", req.SayWhat, req.Recipient.Name, req.Recipient.NumberOfTimes),
		}, nil
	}

	fmt.Printf("%s to World\n", req.SayWhat)

	return &SayReply{
		SaidWhat: fmt.Sprintf("Server says, \"%s\" to World", req.SayWhat),
	}, nil
}
